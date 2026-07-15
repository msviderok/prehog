import { Crons } from '@convex-dev/crons'
import { components, internal } from './_generated/api'
import { mutation } from './_generated/server'
import { CRON_NAME_OFFLINE_CHECKER } from './helpers'
import * as Users from './model/users'

const crons = new Crons(components.crons)

export const updateHeartbeat = mutation({
  handler: async (ctx) => {
    const user = await Users.getCurrentUser(ctx)
    const presence = (await ctx.db.get('presence', user.presenceId))!

    if (presence.isOnline === false) {
      await ctx.db.patch('presence', presence._id, { isOnline: true })
      const onlineCounter = await ctx.db.query('users_online_count').first()
      if (onlineCounter == null) {
        await ctx.db.insert('users_online_count', { count: 1 })
      } else {
        await ctx.db.patch('users_online_count', onlineCounter._id, { count: onlineCounter.count + 1 })
      }

      const existingOfflineCheckerCron = await crons.get(ctx, { name: CRON_NAME_OFFLINE_CHECKER })
      if (existingOfflineCheckerCron == null) {
        await crons.register(
          ctx,
          { kind: 'interval', ms: 10_000 },
          internal.presence.markOfflineIfEmpty,
          {},
          CRON_NAME_OFFLINE_CHECKER,
        )
      }
    }

    const heartbeat = (await ctx.db.get('heartbeats', presence.heartbeatId))!
    await ctx.db.patch('heartbeats', heartbeat._id, { lastSeen: Date.now() })
  },
})
