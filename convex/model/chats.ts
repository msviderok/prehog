import { Id } from '../_generated/dataModel'
import { MutationCtx, QueryCtx } from '../_generated/server'
import * as Users from './users'

export async function getMyChats(ctx: QueryCtx | MutationCtx) {
  const user = await Users.getCurrentUser(ctx)
  const myChatMemberships = await ctx.db
    .query('chat_members')
    .withIndex('by_user', (q) => q.eq('userId', user._id))
    .collect()

  return Promise.all(myChatMemberships.map(({ chatId, userId: myId }) => getChatById(ctx, { myId, chatId })))
}

export async function getChatById(ctx: QueryCtx | MutationCtx, args: { myId: Id<'users'>; chatId: Id<'chats'> }) {
  const chat = await ctx.db.get('chats', args.chatId)
  if (!chat) throw new Error('Chat not found')

  const members = await ctx.db
    .query('chat_members')
    .withIndex('by_chat', (q) => q.eq('chatId', args.chatId))
    .collect()

  const chatMemberMe = members[0].userId === args.myId ? members[0] : members[1]
  const chatMemberThem = members.indexOf(chatMemberMe) === 0 ? members[1] : members[0]
  const contact = await ctx.db.get('users', chatMemberThem.userId)

  return {
    chat: chat!,
    myId: args.myId,
    myMember: chatMemberMe!,
    contact: contact!,
    contactMember: chatMemberThem!,
  }
}

export async function getChatByUserId(ctx: QueryCtx | MutationCtx, userId: Id<'users'>) {
  const myChats = await getMyChats(ctx)
  return myChats.find((chat) => chat.contact._id === userId)!
}

export async function findDirectChatWithUser(ctx: QueryCtx | MutationCtx, userId: Id<'users'>) {
  const chats = await getMyChats(ctx)
  const chat = chats.find((chat) => chat.contactMember.userId === userId)
  return chat
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
