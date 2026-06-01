import { v } from 'convex/values'
import { mutation, query } from './_generated/server'
import * as Users from './model/users'
import * as FloatingPanels from './model/floatingPanels'

export const create = mutation({
  args: {
    type: v.union(v.literal('chat'), v.literal('rtc')),
    chatId: v.id('chats'),
    x: v.number(),
    y: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await Users.getCurrentUser(ctx)
    const existingPanel = await ctx.db
      .query('floating_panels')
      .withIndex('by_user_chat_type', (q) => q.eq('userId', user._id).eq('chatId', args.chatId).eq('type', args.type))
      .unique()

    if (existingPanel) {
      await ctx.db.delete('floating_panels', existingPanel._id)
      await ctx.db.delete('floating_panels_position', existingPanel.positionId)
    }

    const zIndex = await FloatingPanels.getNextHighestLayer(ctx)
    const positionId = await ctx.db.insert('floating_panels_position', {
      zIndex,
      x: args.x,
      y: args.y,
    })
    const floatingPanelId = await ctx.db.insert('floating_panels', {
      type: args.type,
      chatId: args.chatId,
      userId: user._id,
      positionId,
    })

    return ctx.db.get('floating_panels', floatingPanelId)
  },
})

export const remove = mutation({
  args: {
    floatingPanelId: v.id('floating_panels'),
  },
  handler: async (ctx, args) => {
    const panel = await ctx.db.get(args.floatingPanelId)
    if (!panel) return
    await ctx.db.delete(panel.positionId)
    await ctx.db.delete(panel._id)
  },
})

export const byChatAndType = query({
  args: {
    chatId: v.id('chats'),
    type: v.union(v.literal('chat'), v.literal('rtc')),
  },
  handler: async (ctx, args) => {
    const user = await Users.getCurrentUser(ctx)
    const panel = await ctx.db
      .query('floating_panels')
      .withIndex('by_user_chat_type', (q) => q.eq('userId', user._id).eq('chatId', args.chatId).eq('type', args.type))
      .unique()

    return panel
  },
})

export const position = query({
  args: { id: v.id('floating_panels_position') },
  handler: async (ctx, args) => {
    return ctx.db
      .query('floating_panels_position')
      .withIndex('by_id', (q) => q.eq('_id', args.id))
      .unique()
  },
})

export const updatePosition = mutation({
  args: { id: v.id('floating_panels_position'), x: v.number(), y: v.number() },
  handler: async (ctx, { id, ...args }) => {
    const zIndex = await FloatingPanels.getNextHighestLayer(ctx)
    await ctx.db.patch('floating_panels_position', id, { ...args, zIndex })
  },
})
