import { v } from 'convex/values'
import { mutation, query } from './_generated/server'
import * as Users from './model/users'
import { BATCHING_INTERVAL_MS, SAMPLING_INTERVAL_MS } from '../src/lib/constants'

export const findMyActions = query({
  handler: async (ctx) => {
    const user = await Users.getCurrentUser(ctx)
    const state = (await ctx.db.get('game_event_batches', user.gameEventBatchesId))!
    return state.batch
  },
})

export const findMyPosition = query({
  handler: async (ctx) => {
    const user = await Users.getCurrentUser(ctx)
    const pos = (await ctx.db.get('game_user_positions', user.gameUserPositionId))!
    const state = (await ctx.db.get('game_user_state', user.gameUserStateId))!
    return { x: pos.x, y: state.y }
  },
})

export const shouldSendRealTimeMovement = query({
  handler: async (ctx) => {
    const onlineCount = await ctx.db.query('users_online_count').first()
    return onlineCount != null && onlineCount.count > 1
  },
})

export const sendMyBatch = mutation({
  args: {
    batch: v.array(
      v.object({
        type: v.literal('move'),
        x: v.number(),
        t: v.number(),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const now = Date.now() - BATCHING_INTERVAL_MS
    const user = await Users.getCurrentUser(ctx)
    const existingBatch = await ctx.db.get('game_event_batches', user.gameEventBatchesId)
    const batch = args.batch.map((i) => ({ ...i, t: now + i.t }))
    if (existingBatch) {
      return await ctx.db.patch('game_event_batches', existingBatch._id, { batch })
    }

    await ctx.db.insert('game_event_batches', { batch })
  },
})

export const isUserAdmin = query({
  args: {
    userId: v.id('users'),
  },
  handler: async (ctx, args) => {
    const user = (await ctx.db.get('users', args.userId))!
    return user._id === process.env.ADMIN_ID
  },
})

export const getPlayerBatch = query({
  args: {
    userId: v.id('users'),
  },
  handler: async (ctx, args) => {
    const user = (await ctx.db.get('users', args.userId))!
    const batch = (await ctx.db.get('game_event_batches', user.gameEventBatchesId))!
    return batch.batch
  },
})

export const getPlayerGameState = query({
  args: {
    userId: v.id('users'),
  },
  handler: async (ctx, args) => {
    const user = (await ctx.db.get('users', args.userId))!
    const state = (await ctx.db.get('game_user_state', user.gameUserStateId))!
    return state
  },
})

export const setIsWalking = mutation({
  args: {
    isWalking: v.boolean(),
  },
  handler: async (ctx, args) => {
    const user = await Users.getCurrentUser(ctx)
    await ctx.db.patch('game_user_state', user.gameUserStateId, { isWalking: args.isWalking })
  },
})

export const setDirection = mutation({
  args: {
    direction: v.union(v.literal('left'), v.literal('right')),
  },
  handler: async (ctx, args) => {
    const user = await Users.getCurrentUser(ctx)
    await ctx.db.patch('game_user_state', user.gameUserStateId, { movementDir: args.direction })
  },
})
