import { QueryCtx } from '../_generated/server'
import * as Users from './users'

export async function getNextHighestLayer(ctx: QueryCtx) {
  const user = await Users.getCurrentUser(ctx)
  const panels = await ctx.db
    .query('floating_panels')
    .withIndex('by_user', (q) => q.eq('userId', user._id))
    .collect()
  const positions = await Promise.all(panels.map(({ positionId }) => ctx.db.get(positionId)))
  return (positions.map((p) => p?.zIndex ?? 0).sort(Math.max)[0] ?? 0) + 1
}
