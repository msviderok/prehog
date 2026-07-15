import { Crons } from '@convex-dev/crons'
import { components } from './_generated/api'
import { internalMutation } from './_generated/server'
import { CRON_NAME_OFFLINE_CHECKER } from './helpers'
import * as Chats from './model/chats'
import * as Calls from './model/calls'

const HEARTBEAT_TOO_OLD_MS = 10_000

const crons = new Crons(components.crons)

export const markOfflineIfEmpty = internalMutation({
  handler: async (ctx) => {
    const tooOld = Date.now() - HEARTBEAT_TOO_OLD_MS

    const onlinePresences = await ctx.db
      .query('presence')
      .withIndex('by_online', (q) => q.eq('isOnline', true))
      .collect()

    for (const presence of onlinePresences) {
      const heartbeat = await ctx.db.get('heartbeats', presence.heartbeatId)
      if (heartbeat && heartbeat.lastSeen < tooOld) {
        await ctx.db.patch('presence', presence._id, { isOnline: false })

        const onlineCounter = await ctx.db.query('users_online_count').first()
        if (onlineCounter == null) {
          await ctx.db.insert('users_online_count', { count: 0 })
        } else {
          await ctx.db.patch('users_online_count', onlineCounter._id, { count: Math.max(onlineCounter.count - 1, 0) })
        }

        const user = (await ctx.db
          .query('users')
          .withIndex('by_presence', (q) => q.eq('presenceId', presence._id))
          .unique())!

        await Chats.stopUserTyping(ctx, user._id)
        await Calls.cleanupUserCalls(ctx, { userId: user._id, closeFloatingPanels: true })
      }
    }

    const stillOnline = await ctx.db
      .query('presence')
      .withIndex('by_online', (q) => q.eq('isOnline', true))
      .collect()

    if (stillOnline.length === 0) {
      await crons.delete(ctx, { name: CRON_NAME_OFFLINE_CHECKER })
    }
  },
})
