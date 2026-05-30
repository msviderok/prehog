import { Id } from '../_generated/dataModel'
import { QueryCtx } from '../_generated/server'

export async function getCurrentUser(ctx: QueryCtx) {
  const identity = await ctx.auth.getUserIdentity()
  if (identity === null) {
    throw new Error('Not authenticated via Clerk')
  }

  const user = await userByExternalId(ctx, identity.subject)
  if (!user) throw new Error("Can't get current user")

  return user
}

export async function userByExternalId(ctx: QueryCtx, externalId: string) {
  return await ctx.db
    .query('users')
    .withIndex('by_clerkId', (q) => q.eq('externalId', externalId))
    .unique()
}

export async function getOnline(ctx: QueryCtx, userId: Id<'users'>) {
  return (await ctx.db
    .query('online')
    .withIndex('by_user', (q) => q.eq('userId', userId))
    .unique())!
}
