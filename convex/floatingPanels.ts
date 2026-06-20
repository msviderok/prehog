import { v } from 'convex/values'
import { mutation, query } from './_generated/server'
import * as Users from './model/users'
import * as FloatingPanels from './model/floatingPanels'

export const create = mutation({
  args: {
    x: v.number(),
    y: v.number(),
    data: v.union(
      v.object({ type: v.literal('chat'), chatId: v.id('chats') }),
      v.object({ type: v.literal('rtc'), callId: v.id('calls') }),
    ),
  },
  handler: async (ctx, { x, y, data: args }) => {
    const user = await Users.getCurrentUser(ctx)
    const panel = await FloatingPanels.createNewPanel(ctx, { x, y, ...args, userId: user._id })
    return panel
  },
})

export const remove = mutation({
  args: {
    floatingPanelId: v.id('floating_panels'),
  },
  handler: async (ctx, args) => {
    await FloatingPanels.deletePanelById(ctx, args.floatingPanelId)
  },
})

export const byType = query({
  args: {
    params: v.union(
      v.object({ type: v.literal('chat'), chatId: v.id('chats') }),
      v.object({ type: v.literal('rtc'), callId: v.id('calls') }),
    ),
  },
  handler: async (ctx, args) => {
    const panel = await FloatingPanels.getMyFloatingPanel(ctx, args.params)
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
