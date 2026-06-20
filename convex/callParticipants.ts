import { v } from 'convex/values'
import { query } from './_generated/server'
import * as Calls from './model/calls'

export const byId = query({
  args: {
    participantId: v.id('call_participants'),
  },
  handler: async (ctx, args) => {
    const participant = await ctx.db.get(args.participantId)
    return participant
  },
})

export const byUserId = query({
  args: {
    userId: v.id('users'),
  },
  handler: async (ctx, args) => {
    const participant = await Calls.getActiveParticipantByUser(ctx, args.userId)
    return participant
  },
})
