import { type UserJSON } from '@clerk/backend'
import { v, Validator } from 'convex/values'
import { internalMutation, mutation, query } from './_generated/server'
import * as Users from './model/users'
import * as Chats from './model/chats'
import { Id } from './_generated/dataModel'

export const createSession = internalMutation({
  args: {
    clerkUserId: v.string(),
    data: v.any() as Validator<UserJSON | null>, // no runtime validation, trust Clerk
  },
  handler: async (ctx, { clerkUserId, data }) => {
    await Users.ensureUserExists(ctx, data ?? { clerkUserId })
  },
})

export const deleteSession = internalMutation({
  args: {
    clerkUserId: v.string(),
  },
  handler: async (ctx, { clerkUserId }) => {},
})

export const upsertUserFromClerk = internalMutation({
  args: {
    data: v.any() as Validator<UserJSON>, // no runtime validation, trust Clerk
  },
  handler: async (ctx, { data }) => {
    await Users.ensureUserExists(ctx, data)
    const user = await Users.getUserByExternalId(ctx, data.id)
    await ctx.db.patch(user._id, {
      externalId: data.id,
      fullname: `${data.first_name} ${data.last_name}`,
      avatar: data.image_url,
    })
  },
})

export const deleteUserFromClerk = internalMutation({
  args: { clerkUserId: v.string() },
  async handler(ctx, { clerkUserId }) {
    const user = await Users.getUserByExternalId(ctx, clerkUserId)
    await Users.eraseUserFromExistence(ctx, user._id)
  },
})
