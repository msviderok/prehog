import { UserJSON } from '@clerk/backend'
import { asyncMap } from 'convex-helpers'
import { SCENE } from '../../src/lib/constants'
import { MutationCtx, QueryCtx } from '../_generated/server'
import * as Calls from './calls'
import * as FloatingPanels from './floatingPanels'

/** @throws */
export async function getCurrentUser(ctx: QueryCtx) {
  const identity = await ctx.auth.getUserIdentity()
  if (identity === null) {
    throw new Error('Not authenticated via Clerk')
  }

  const user = await getUserByExternalId(ctx, identity.subject)
  if (!user) throw new Error("Can't get current user")

  return user
}

/** Get a user by their external ID (Clerk subject) */
export async function getUserByExternalId(ctx: QueryCtx, externalId: string) {
  const user = await ctx.db
    .query('users')
    .withIndex('by_clerkId', (q) => q.eq('externalId', externalId))
    .unique()
  if (!user) throw new Error(`User not found by externalId: ${externalId}`)
  return user
}

export async function ensureUserExists(ctx: MutationCtx, userData: UserJSON | { clerkUserId: string }) {
  const hasUserData = 'id' in userData
  const clerkUserId = hasUserData ? userData.id : userData.clerkUserId
  const user = await ctx.db
    .query('users')
    .withIndex('by_clerkId', (q) => q.eq('externalId', clerkUserId))
    .unique()

  if (user) return

  const newHeartbeatId = await ctx.db.insert('heartbeats', { lastSeen: Date.now() })
  const newPresenceId = await ctx.db.insert('presence', { isOnline: false, heartbeatId: newHeartbeatId })
  const newGameEventBatchId = await ctx.db.insert('game_event_batches', { batch: [] })
  const newGameUserPositionId = await ctx.db.insert('game_user_positions', { x: SCENE.main.playerInitialX })
  const newGameUserStateId = await ctx.db.insert('game_user_state', {
    isWalking: false,
    isRunning: false,
    movementDir: 'right',
    scene: 'main',
    y: SCENE.main.playerInitialY,
  })

  await ctx.db.insert('users', {
    externalId: clerkUserId,
    presenceId: newPresenceId,
    gameEventBatchesId: newGameEventBatchId,
    gameUserPositionId: newGameUserPositionId,
    gameUserStateId: newGameUserStateId,
    fullname: hasUserData ? `${userData.first_name} ${userData.last_name}` : 'Unknown User',
    avatar: hasUserData ? userData.image_url : undefined,
  })
}

export async function eraseUserFromExistence(ctx: MutationCtx, externalId: string) {
  const user = await ctx.db
    .query('users')
    .withIndex('by_clerkId', (q) => q.eq('externalId', externalId))
    .unique()
  if (!user) return

  await ctx.db.delete('users', user._id)
  await ctx.db.delete('game_event_batches', user.gameEventBatchesId)
  await ctx.db.delete('game_user_positions', user.gameUserPositionId)

  const presence = (await ctx.db.get('presence', user.presenceId))!
  await ctx.db.delete('presence', presence._id)
  await ctx.db.delete('heartbeats', presence.heartbeatId)

  await asyncMap(
    await ctx.db
      .query('chat_members')
      .withIndex('by_user', (q) => q.eq('userId', user._id))
      .collect(),
    async (m) => await ctx.db.delete('chat_members', m._id),
  )

  await Calls.cleanupUserCalls(ctx, { userId: user._id })
  await FloatingPanels.deletePanelsForUser(ctx, user._id)
}
