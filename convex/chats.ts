import { v } from 'convex/values'
import { mutation, query } from './_generated/server'
import * as Chats from './model/chats'
import * as FloatingPanels from './model/floatingPanels'
import * as Users from './model/users'

export const initChat = mutation({
  args: {
    x: v.number(),
    y: v.number(),
    userId: v.id('users'),
  },
  handler: async (ctx, args) => {
    const user = await Users.getCurrentUser(ctx)
    const newChatId = await ctx.db.insert('chats', {})

    await ctx.db.insert('chat_members', { chatId: newChatId, userId: user._id })
    await ctx.db.insert('typing', { chatId: newChatId, userId: user._id, isTyping: false })

    await ctx.db.insert('chat_members', { chatId: newChatId, userId: args.userId })
    await ctx.db.insert('typing', { chatId: newChatId, userId: args.userId, isTyping: false })

    await FloatingPanels.createNewPanel(ctx, {
      x: args.x,
      y: args.y,
      type: 'chat',
      chatId: newChatId,
      userId: user._id,
    })
  },
})

export const openChat = mutation({
  args: {
    x: v.number(),
    y: v.number(),
    userId: v.id('users'),
  },
  handler: async (ctx, args) => {
    const user = await Users.getCurrentUser(ctx)
    const directChat = await Chats.getDirectChatWithUser(ctx, args.userId)
    if (!directChat) throw new Error('No direct chat found')
    await FloatingPanels.createNewPanel(ctx, {
      x: args.x,
      y: args.y,
      type: 'chat',
      chatId: directChat._id,
      userId: user._id,
    })
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
    await ctx.db.insert('chat_messages', { ...args, type: 'dm', userId: user._id })
  },
})

export const messages = query({
  args: {
    chatId: v.id('chats'),
  },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query('chat_messages')
      .withIndex('by_chat', (q) => q.eq('chatId', args.chatId))
      .collect()
    return messages
  },
})

export const byId = query({
  args: {
    chatId: v.id('chats'),
  },
  handler: async (ctx, args) => {
    const chat = await ctx.db.get(args.chatId)
    return chat
  },
})

export const findByUserId = query({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    const directChat = await Chats.getDirectChatWithUser(ctx, args.userId)

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

export const getMembers = query({
  args: {
    chatId: v.id('chats'),
  },
  handler: async (ctx, args) => {
    const members = await ctx.db
      .query('chat_members')
      .withIndex('by_chat', (q) => q.eq('chatId', args.chatId))
      .collect()
    return members
  },
})
