import { type UserJSON } from '@clerk/backend'
import { v, Validator } from 'convex/values'
import { internalMutation, mutation, query } from './_generated/server'
import * as Users from './model/users'
import { userEvent } from './schema'

export const current = query({
  handler: async (ctx) => {
    const user = await Users.getCurrentUser(ctx)
    return user
  },
})

export const updateMe = mutation({
  args: {
    x: v.number(),
    y: v.number(),
    actions: v.array(userEvent),
  },
  handler: async (ctx, args) => {
    const user = await Users.getCurrentUser(ctx)
    await ctx.db.patch('users', user._id, {
      eventBatches: args.actions.splice(0, 100),
      x: args.x,
      y: args.y,
    })
  },
})

export const listAllUsers = query(async (ctx) => {
  const user = await Users.getCurrentUser(ctx)
  const allUsers = await ctx.db
    .query('users')
    .filter((q) => q.neq(q.field('_id'), user._id))
    .collect()

  return allUsers
})

export const byId = query({
  args: {
    userId: v.id('users'),
  },
  handler: async (ctx, args) => {
    return ctx.db.get('users', args.userId)
  },
})

export const upsertFromClerk = internalMutation({
  args: {
    data: v.any() as Validator<UserJSON>, // no runtime validation, trust Clerk
  },
  async handler(ctx, { data }) {
    const user = await Users.userByExternalId(ctx, data.id)
    if (user === null) {
      await ctx.db.insert('users', {
        externalId: data.id,
        eventBatches: [],
        x: 0,
        y: 100,
        isOnline: false,
        fullname: `${data.first_name} ${data.last_name}`,
        avatar: data.image_url,
      })
    } else {
      await ctx.db.patch(user._id, {
        externalId: data.id,
        fullname: `${data.first_name} ${data.last_name}`,
        avatar: data.image_url,
      })
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

export const setOnline = mutation({
  args: {
    online: v.boolean(),
  },
  handler: async (ctx, args) => {
    const user = await Users.getCurrentUser(ctx)
    return ctx.db.patch(user._id, { isOnline: args.online })
  },
})
