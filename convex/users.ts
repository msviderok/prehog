import { type UserJSON } from '@clerk/backend'
import { v, Validator } from 'convex/values'
import { internalMutation, mutation, query } from './_generated/server'
import * as Users from './model/users'
import * as Chats from './model/chats'
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

export const usersWithChat = query(async (ctx) => {
  const user = await Users.getCurrentUser(ctx)
  const myChats = await Chats.getMyChats(ctx)
  const list = await Promise.all(
    myChats.map(async ({ chat: { _id: chatId }, contact }) => {
      const chat = await Chats.getChatById(ctx, { myId: user._id, chatId })
      return { chat, user: contact }
    }),
  )
  return list
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
      const newUserId = await ctx.db.insert('users', {
        externalId: data.id,
        eventBatches: [],
        x: 0,
        y: 100,
        fullname: `${data.first_name} ${data.last_name}`,
        avatar: data.image_url,
      })
      await ctx.db.insert('online', { userId: newUserId, isOnline: false })
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

export const setMyOnline = mutation({
  args: {
    isOnline: v.boolean(),
  },
  handler: async (ctx, args) => {
    const user = await Users.getCurrentUser(ctx)
    const presence = await Users.getOnline(ctx, user._id)
    if (presence.isOnline === args.isOnline) return
    await ctx.db.patch('online', presence._id, args)
  },
})

export const setOnline = mutation({
  args: {
    userId: v.id('users'),
    isOnline: v.boolean(),
  },
  handler: async (ctx, args) => {
    const presence = await Users.getOnline(ctx, args.userId)
    if (presence.isOnline === args.isOnline) return
    await ctx.db.patch('online', presence._id, args)
  },
})

export const isOnline = query({
  args: {
    userId: v.id('users'),
  },
  handler: async (ctx, args) => {
    const presence = await Users.getOnline(ctx, args.userId)
    return presence.isOnline
  },
})
