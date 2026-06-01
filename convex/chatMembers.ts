import { v } from 'convex/values'
import { query } from './_generated/server'

export const byChat = query({
  args: {
    chatId: v.id('chats'),
  },
  handler: async (ctx, args) => {
    const members = await ctx.db
      .query('chat_members')
      .withIndex('by_chat', (q) => q.eq('chatId', args.chatId))
      .collect()
    if (members.length < 2) throw new Error(`Direct chat requires at least 2 members, found ${members.length}.`)
    return members
  },
})

export const byChatAndUser = query({
  args: {
    chatId: v.id('chats'),
    userId: v.id('users'),
  },
  handler: async (ctx, args) => {
    const member = await ctx.db
      .query('chat_members')
      .withIndex('by_chat_user', (q) => q.eq('chatId', args.chatId).eq('userId', args.userId))
      .unique()
    if (!member) throw new Error('No member found')
    return member
  },
})
