import { v } from 'convex/values'
import { differenceInCalendarDays, formatDate } from 'date-fns'
import { mutation, query } from './_generated/server'
import * as Chats from './model/chats'
import * as Users from './model/users'

export const initChat = mutation({
  args: {
    contactId: v.id('users'),
  },
  handler: async (ctx, args) => {
    const user = await Users.getCurrentUser(ctx)
    const chat = await Chats.findDirectChatWithUser(ctx, args.contactId)
    if (chat) return { chatId: chat.chat._id }

    const newChatId = await ctx.db.insert('chats', {})
    await ctx.db.insert('chat_members', { userId: user._id, chatId: newChatId, isTyping: false })
    await ctx.db.insert('chat_members', { userId: args.contactId, chatId: newChatId, isTyping: false })
    return { chatId: newChatId }
  },
})

export const lastMessage = query({
  args: {
    chatId: v.id('chats'),
  },
  handler: async (ctx, args) => {
    const lastMessage = await Chats.getLastMessage(ctx, args.chatId)
    if (!lastMessage) return null

    const sender = await Chats.getSenderByMemberId(ctx, lastMessage.chatMemberId)

    const days = differenceInCalendarDays(new Date(), lastMessage._creationTime)
    return {
      createdAt: formatDate(lastMessage._creationTime, days === 0 ? 'HH:mm' : days < 7 ? 'EEE' : 'dd.MM.YYYY'),
      body: lastMessage.body,
      fromUserId: sender?.user?._id,
    }
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

export const setIsTyping = mutation({
  args: {
    chatMemberId: v.id('chat_members'),
    isTyping: v.boolean(),
  },
  handler: async (ctx, args) => {
    const typing = await Chats.getIsTyping(ctx, args.chatMemberId)
    if (typing.isTyping === args.isTyping) return
    await ctx.db.patch('typing', typing._id, args)
  },
})

export const isTyping = query({
  args: {
    chatMemberId: v.id('chat_members'),
  },
  handler: async (ctx, args) => {
    const typing = await Chats.getIsTyping(ctx, args.chatMemberId)
    return typing.isTyping
  },
})
