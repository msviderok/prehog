import { type UserJSON } from '@clerk/backend'
import { v, Validator } from 'convex/values'
import { internalMutation, mutation, query } from './_generated/server'
import * as Users from './model/users'
import { userEvent } from './schema'

export const current = query({
  handler: (ctx) => {
    return Users.getCurrentUser(ctx)
  },
})

export const updateEventBatch = mutation({
  args: {
    userId: v.id('users'),
    actions: v.array(userEvent),
  },
  handler: async (ctx, args) => {
    const user = await Users.getCurrentUserOrThrow(ctx)
    await ctx.db.patch('users', user?._id, { eventBatches: args.actions.splice(0, 100) })
  },
})

export const upsertFromClerk = internalMutation({
  args: {
    data: v.any() as Validator<UserJSON>, // no runtime validation, trust Clerk
  },
  async handler(ctx, { data }) {
    const user = await Users.userByExternalId(ctx, data.id)
    if (user === null) {
      await ctx.db.insert('users', { externalId: data.id, eventBatches: [] })
    } else {
      await ctx.db.patch(user._id, { externalId: data.id, eventBatches: [] })
    }
  },
})

export const deleteFromClerk = internalMutation({
  args: { clerkUserId: v.string() },
  async handler(ctx, { clerkUserId }) {
    const user = await Users.userByExternalId(ctx, clerkUserId)

    if (user !== null) {
      await ctx.db.delete(user._id)
    } else {
      console.warn(`Can't delete user, there is none for Clerk user ID: ${clerkUserId}`)
    }
  },
})
