import { v } from 'convex/values'
import { Id } from './_generated/dataModel'
import { action, env, query } from './_generated/server'
import * as Chats from './model/chats'
import * as Users from './model/users'
import { asyncMap, pick, pruneNull } from 'convex-helpers'

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

export const listOnlineUsers = query({
  handler: async (ctx) => {
    const user = await Users.getCurrentUser(ctx)
    const ids = await asyncMap(
      await ctx.db
        .query('users')
        .filter((q) => q.neq(q.field('_id'), user._id))
        .collect(),
      async (u) => {
        const presence = (await ctx.db.get('presence', u.presenceId))!
        return presence.isOnline ? u._id : null
      },
    )

    return pruneNull(ids)
  },
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

export const getProfile = query({
  args: {
    userId: v.id('users'),
  },
  handler: async (ctx, args) => {
    const user = (await ctx.db.get('users', args.userId))!
    return pick(user, ['avatar', 'fullname'])
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

export const isOnline = query({
  args: {
    userId: v.id('users'),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get('users', args.userId)
    if (!user) throw new Error(`User not found: ${args.userId}`)
    const presence = (await ctx.db.get('presence', user.presenceId))!
    return presence.isOnline
  },
})

export const floatingPanels = query({
  handler: async (ctx) => {
    const user = await Users.getCurrentUser(ctx)
    const panels = await ctx.db
      .query('floating_panels')
      .withIndex('by_user', (q) => q.eq('userId', user._id))
      .collect()
    return panels
  },
})

export const pingAdmin = action({
  handler: async (ctx) => {
    const data = await fetch(
      `https://api.telegram.org/bot${encodeURIComponent(env.TG_BOT_TOKEN!)}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: env.TG_BOT_CHAT_ID,
          text: 'Convex msg',
        }),
      },
    )
  },
})
