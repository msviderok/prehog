import { v } from 'convex/values'
import { mutation, query } from './_generated/server'
import * as Calls from './model/calls'
import * as Users from './model/users'

export const byId = query({
  args: {
    callId: v.id('calls'),
  },
  handler: async (ctx, args) => {
    const call = await ctx.db.get(args.callId)
    return call
  },
})

export const initCall = mutation({
  args: {
    x: v.number(),
    y: v.number(),
    userId: v.id('users'),
  },
  handler: async (ctx, args) => {
    const user = await Users.getCurrentUser(ctx)
    await Calls.createNewCallWithCleanup(ctx, {
      x: args.x,
      y: args.y,
      fromUserId: user._id,
      toUserId: args.userId,
    })
  },
})
