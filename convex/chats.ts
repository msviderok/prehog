import { v } from 'convex/values'
import { mutation, query } from './_generated/server'
import * as Chats from './model/chats'
import * as Users from './model/users'

export const ringUser = mutation({
  args: {
    contactId: v.id('users'),
    audio: v.boolean(),
    video: v.boolean(),
  },
  handler: async (ctx, args) => {},
})

export const initChat = mutation({
  args: {
    contactId: v.id('users'),
  },
  handler: async (ctx, args) => {
    const user = await Users.getCurrentUser(ctx)
    const chat = await Chats.findDirectChatWithUser(ctx, args.contactId)
    if (chat) return { chatId: chat.chat._id }

    const newChatId = await ctx.db.insert('chats', {})
    await ctx.db.insert('chat_members', { userId: user._id, chatId: newChatId, itTyping: false })
    await ctx.db.insert('chat_members', { userId: args.contactId, chatId: newChatId, itTyping: false })
    return { chatId: newChatId }
  },
})

export const sendMessage = mutation({
  args: {
    chatId: v.id('chats'),
    chatMemberId: v.id('chat_members'),
    body: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert('chat_messages', args)
  },
})

export const messages = query({
  args: {
    chatId: v.id('chats'),
  },
  handler: async (ctx, args) => {
    return ctx.db
      .query('chat_messages')
      .withIndex('by_chat', (q) => q.eq('chatId', args.chatId))
      .collect()
  },
})

export const byId = query({
  args: {
    chatId: v.id('chats'),
  },
  handler: async (ctx, args) => {
    const user = await Users.getCurrentUser(ctx)
    return Chats.getChatById(ctx, { chatId: args.chatId, myId: user._id })
  },
})

export const byUserId = query({
  args: {
    userId: v.id('users'),
  },
  handler: async (ctx, args) => {
    return Chats.getChatByUserId(ctx, args.userId)
  },
})

export const signalTyping = mutation({
  args: {
    memberId: v.id('chat_members'),
    isTyping: v.boolean(),
  },
  handler: async (ctx, args) => {
    return ctx.db.patch('chat_members', args.memberId, { itTyping: args.isTyping })
  },
})
