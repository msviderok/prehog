import { type UserJSON } from '@clerk/backend'
import { v, Validator } from 'convex/values'
import { internalMutation, mutation, query } from './_generated/server'
import * as Users from './model/users'
import * as Chats from './model/chats'
import { Id } from './_generated/dataModel'

export const current = query({
  handler: async (ctx) => {
    const user = await Users.getCurrentUser(ctx)
    return user
  },
})

export const usersWithChat = query(async (ctx) => {
  const user = await Users.getCurrentUser(ctx)
  const myChatMemberIds = await ctx.db
    .query('chat_members')
    .withIndex('by_user', (q) => q.eq('userId', user._id))
    .collect()

  const myChatIds = myChatMemberIds.map(({ chatId }) => chatId)
  const users = await Promise.all(
    myChatIds.map(async (id) => {
      const member = await ctx.db
        .query('chat_members')
        .filter((q) => q.and(q.eq(q.field('chatId'), id), q.neq(q.field('userId'), user._id)))
        .unique()
      return member ? ctx.db.get('users', member.userId) : null
    }),
  )

  return users.filter((u): u is NonNullable<typeof u> => !!u)
})

export const unconnectedUsers = query(async (ctx) => {
  const user = await Users.getCurrentUser(ctx)
  const allUsers = await ctx.db
    .query('users')
    .filter((q) => q.neq(q.field('_id'), user._id))
    .collect()
  const myChats = await Chats.getMyChats(ctx)

  const participantsOfMyChats = await Promise.all(
    myChats.map((chat) =>
      ctx.db
        .query('chat_members')
        .withIndex('by_chat', (q) => q.eq('chatId', chat._id))
        .collect(),
    ),
  )

  const connectedUserIds = participantsOfMyChats.reduce((acc, participants) => {
    for (const p of participants) {
      // ignore me
      if (p.userId === user._id) continue
      // include users my user has chats with
      if (acc.includes(p.userId) === false) acc.push(p.userId)
    }
    return acc
  }, [] as Id<'users'>[])

  const usersWithNoChats = allUsers.filter((u) => connectedUserIds.includes(u._id) === false)
  return usersWithNoChats
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

export const byChatId = query({
  args: {
    chatId: v.id('chats'),
  },
  handler: async (ctx, args) => {
    const user = await Users.getCurrentUser(ctx)
    const members = await ctx.db
      .query('chat_members')
      .withIndex('by_chat', (q) => q.eq('chatId', args.chatId))
      .collect()

    const contactMember = members.find((m) => m.userId !== user._id)
    if (!contactMember) throw new Error('No contact member found')

    const contactUser = await ctx.db.get('users', contactMember.userId)
    if (!contactUser) throw new Error('Contact user not found')
    return contactUser
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
    try {
      const user = await Users.getCurrentUser(ctx)
      const presence = await Users.getOnline(ctx, user._id)
      if (presence.isOnline === args.isOnline) return
      await ctx.db.patch('online', presence._id, args)
    } catch (e) {}
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

export const floatingPanels = query({
  args: {},
  handler: async (ctx) => {
    try {
      const user = await Users.getCurrentUser(ctx)
      const panels = await ctx.db
        .query('floating_panels')
        .withIndex('by_user', (q) => q.eq('userId', user._id))
        .collect()
      return panels
    } catch (e) {}
  },
})
