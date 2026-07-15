import { asyncMap } from 'convex-helpers'
import { Doc, Id } from '../_generated/dataModel'
import { MutationCtx, QueryCtx } from '../_generated/server'
import * as Users from './users'

export async function getMyChats(ctx: QueryCtx | MutationCtx) {
  const user = await Users.getCurrentUser(ctx)
  const myChatMembers = await ctx.db
    .query('chat_members')
    .withIndex('by_user', (q) => q.eq('userId', user._id))
    .collect()
  const myChatIds = myChatMembers.map(({ chatId }) => chatId)
  const myChats = (await Promise.all(myChatIds.map((id) => ctx.db.get(id)))).filter(Boolean)
  return myChats
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

export async function getDirectChatWithUser(ctx: QueryCtx | MutationCtx, userId: Id<'users'>) {
  const user = await Users.getCurrentUser(ctx)
  const chats = await getMyChats(ctx)

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

  const directChat = chats.find((chat) => {
    const group = membersGrouped.get(chat._id)?.map((p) => p.userId)
    return group && group.length === 2 && group.includes(user._id) && group.includes(userId)
  })

  return directChat
}

export async function stopUserTyping(ctx: MutationCtx, userId: Id<'users'>) {
  await asyncMap(
    await ctx.db
      .query('chat_members')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .collect(),
    (m) => ctx.db.patch('chat_members', m._id, { isTyping: false }),
  )
}
