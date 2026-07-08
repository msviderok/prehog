import { MutationCtx, QueryCtx } from '../_generated/server'
import * as Users from './users'

export async function findMyGameState(ctx: QueryCtx | MutationCtx) {
  const user = await Users.getCurrentUser(ctx)
  const state = await ctx.db
    .query('users_game_state')
    .withIndex('by_user', (q) => q.eq('userId', user._id))
    .unique()
  return state
}
