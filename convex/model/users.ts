import { Id } from '../_generated/dataModel'
import { MutationCtx, QueryCtx } from '../_generated/server'

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
  const user = await ctx.db
    .query('users')
    .withIndex('by_id', (q) => q.eq('_id', userId))
    .unique()
  if (!user) throw new Error('User not found')
  return user.isOnline
}

export async function cleanupUserActivity(ctx: MutationCtx, userId: Id<'users'>) {
  const members = await ctx.db
    .query('chat_members')
    .withIndex('by_user', (q) => q.eq('userId', userId))
    .collect()
  const typingMembers = members.filter((m) => m.isTyping)
  await Promise.all(typingMembers.map((m) => ctx.db.patch('chat_members', m._id, { isTyping: false })))

  const callParticipants = await ctx.db
    .query('call_participants')
    .withIndex('by_user', (q) => q.eq('userId', userId))
    .collect()
  await Promise.all(callParticipants.map((p) => ctx.db.delete('call_participants', p._id)))

  for (const { callId } of callParticipants) {
    const callRtcMessages = await ctx.db
      .query('call_rtc_messages')
      .withIndex('by_call', (q) => q.eq('callId', callId))
      .collect()
    await Promise.all(callRtcMessages.map((m) => ctx.db.delete('call_rtc_messages', m._id)))

    const floatingPanels = await ctx.db
      .query('floating_panels')
      .withIndex('by_call', (q) => q.eq('callId', callId))
      .collect()
    await Promise.all(floatingPanels.map((p) => ctx.db.delete('floating_panels', p._id)))
    await Promise.all(floatingPanels.map((p) => ctx.db.delete('floating_panels_position', p.positionId)))

    await ctx.db.delete('calls', callId)
  }
}
