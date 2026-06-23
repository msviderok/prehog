import { Doc, Id } from '../_generated/dataModel'
import { MutationCtx, QueryCtx } from '../_generated/server'
import * as Users from './users'

export async function getMyChats(ctx: QueryCtx | MutationCtx) {
  const user = await Users.getCurrentUser(ctx)
  const myChatMembers = await getChatMembersByUserId(ctx, user._id)
  const myChatIds = myChatMembers.map(({ chatId }) => chatId)
  const myChats = await getChatsByChatIds(ctx, myChatIds)
  return myChats
}

export async function getChatMembersByUserId(ctx: QueryCtx | MutationCtx, userId: Id<'users'>) {
  return ctx.db
    .query('chat_members')
    .withIndex('by_user', (q) => q.eq('userId', userId))
    .collect()
}

export async function getChatMembersByChatIds(ctx: QueryCtx | MutationCtx, chatIds: Id<'chats'>[]) {
  return (
    await Promise.all(
      chatIds.map((chatId) =>
        ctx.db
          .query('chat_members')
          .withIndex('by_chat', (q) => q.eq('chatId', chatId))
          .unique(),
      ),
    )
  ).filter(Boolean)
}

export async function getChatsByChatIds(ctx: QueryCtx | MutationCtx, chatIds: Id<'chats'>[]) {
  return (await Promise.all(chatIds.map((id) => ctx.db.get(id)))).filter(Boolean)
}

export async function getChatIdsByMemberIds(ctx: QueryCtx | MutationCtx, memberIds: Id<'chat_members'>[]) {
  return (await Promise.all(memberIds.map((memberId) => ctx.db.get(memberId)))).filter(Boolean)
}

export async function getMyChatMembership(ctx: QueryCtx | MutationCtx, chatId: Id<'chats'>) {
  const user = await Users.getCurrentUser(ctx)
  const myMembership = await ctx.db
    .query('chat_members')
    .withIndex('by_chat_user', (q) => q.eq('chatId', chatId).eq('userId', user._id))
    .unique()

  if (!myMembership) throw new Error('Wrong chat?')
  return myMembership
}

export async function getLastMessage(ctx: QueryCtx | MutationCtx, chatId: Id<'chats'>) {
  return ctx.db
    .query('chat_messages')
    .withIndex('by_chat', (q) => q.eq('chatId', chatId))
    .order('desc')
    .first()
}

export async function getSenderByMemberId(ctx: QueryCtx | MutationCtx, memberId: Id<'chat_members'>) {
  const member = await ctx.db
    .query('chat_members')
    .withIndex('by_id', (q) => q.eq('_id', memberId))
    .first()
  if (!member) return null

  const user = await ctx.db
    .query('users')
    .withIndex('by_id', (q) => q.eq('_id', member.userId))
    .first()

  return { member, user }
}

export async function getIsTyping(ctx: QueryCtx, args: Pick<Doc<'chat_members'>, 'chatId' | 'userId'>) {
  const chat = await ctx.db
    .query('chat_members')
    .withIndex('by_chat_user', (q) => q.eq('chatId', args.chatId).eq('userId', args.userId))
    .unique()
  if (!chat) throw new Error('Chat not found')
  return chat.isTyping
}

export async function getGroupedMembersBetweenMeAndUser(ctx: QueryCtx | MutationCtx, userId: Id<'users'>) {
  const user = await Users.getCurrentUser(ctx)
  const members = await ctx.db
    .query('chat_members')
    .filter((p) => {
      const isMyUser = p.eq(p.field('userId'), user._id)
      const isContact = p.eq(p.field('userId'), userId)
      return p.or(isMyUser, isContact)
    })
    .collect()
  const membersGrouped = members.reduce((acc, member) => {
    if (acc.has(member.chatId)) acc.get(member.chatId)!.push(member)
    else acc.set(member.chatId, [member])
    return acc
  }, new Map<Id<'chats'>, Doc<'chat_members'>[]>())
  return membersGrouped
}

export async function getDirectChatWithUser(ctx: QueryCtx | MutationCtx, userId: Id<'users'>) {
  const user = await Users.getCurrentUser(ctx)
  const chats = await getMyChats(ctx)
  const membersGrouped = await getGroupedMembersBetweenMeAndUser(ctx, userId)
  const directChat = chats.find((chat) => {
    const group = membersGrouped.get(chat._id)?.map((p) => p.userId)
    return group && group.length === 2 && group.includes(user._id) && group.includes(userId)
  })
  return directChat
}
