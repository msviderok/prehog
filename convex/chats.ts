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
    // const user = await Users.getCurrentUser(ctx)
    // const chat = await Chats.findDirectChatWithUser(ctx, args.contactId)
    // if (chat) return { chatId: chat.chat._id }
    // const newChatId = await ctx.db.insert('chats', {})
    // await ctx.db.insert('chat_members', { userId: user._id, chatId: newChatId, isTyping: false })
    // await ctx.db.insert('chat_members', { userId: args.contactId, chatId: newChatId, isTyping: false })
    // return { chatId: newChatId }
  },
})

export const lastMessage = query({
  args: {
    chatId: v.id('chats'),
  },
  handler: async (ctx, args) => {
    const lastMessage = await Chats.getLastMessage(ctx, args.chatId)
    return lastMessage
  },
})

export const sendMessage = mutation({
  args: {
    chatId: v.id('chats'),
    body: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await Users.getCurrentUser(ctx)
    await ctx.db.insert('chat_messages', { ...args, userId: user._id })
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
    return ctx.db.get(args.chatId)
  },
})

export const byUserId = query({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    const user = await Users.getCurrentUser(ctx)
    const chats = await Chats.getMyChats(ctx)
    const membersGrouped = await Chats.getGroupedMembersBetweenMeAndUser(ctx, args.userId)
    const directChat = chats.find((chat) => {
      const group = membersGrouped.get(chat._id)?.map((p) => p.userId)
      return group && group.length === 2 && group.includes(user._id) && group.includes(args.userId)
    })
    if (!directChat) throw new Error('No direct chat found')
    return directChat
  },
})

export const setIsTyping = mutation({
  args: {
    chatId: v.id('chats'),
    isTyping: v.boolean(),
  },
  handler: async (ctx, { isTyping, ...args }) => {
    const user = await Users.getCurrentUser(ctx)
    const typing = await Chats.getIsTyping(ctx, { ...args, userId: user._id })
    if (typing.isTyping === isTyping) return
    await ctx.db.patch('typing', typing._id, { isTyping })
  },
})

export const isTyping = query({
  args: {
    userId: v.id('users'),
    chatId: v.id('chats'),
  },
  handler: async (ctx, args) => {
    const typing = await Chats.getIsTyping(ctx, args)
    return typing.isTyping
  },
})
