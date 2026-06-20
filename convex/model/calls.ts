import { Doc, Id } from '../_generated/dataModel'
import { type MutationCtx, type QueryCtx } from '../_generated/server'
import * as Users from './users'
import * as FloatingPanels from './floatingPanels'

export async function findMyCurrentCall(ctx: QueryCtx | MutationCtx) {
  const myParticipant = await getMyCurrentActiveParticipant(ctx)
  if (!myParticipant) return null
  const call = await ctx.db.get(myParticipant.callId)
  if (!call) return null
  return { call, myParticipant }
}

/**
 * @throws
 */
export async function getMyCurrentCall(ctx: QueryCtx | MutationCtx) {
  const myParticipant = await getMyCurrentActiveParticipant(ctx)
  if (!myParticipant) throw new Error('No active call participant')

  const call = await ctx.db.get(myParticipant.callId)
  if (!call) throw new Error('Call not found')

  const guestUserId = myParticipant.role === 'host' ? call.toUserId : call.fromUserId
  const guestParticipant = await getActiveParticipantByUser(ctx, guestUserId)
  return { call, myParticipant, guestParticipant }
}

export async function getMyCurrentActiveParticipant(ctx: QueryCtx | MutationCtx) {
  const user = await Users.getCurrentUser(ctx)
  const participant = getActiveParticipantByUser(ctx, user._id)
  return participant
}

export async function getActiveParticipantByUser(ctx: QueryCtx | MutationCtx, userId: Id<'users'>) {
  const participant = await ctx.db
    .query('call_participants')
    .withIndex('by_user', (q) => q.eq('userId', userId))
    .unique()
  return participant
}

export async function deleteCallParticipants(ctx: MutationCtx, callId: Id<'calls'>) {
  const participants = await ctx.db
    .query('call_participants')
    .withIndex('by_call', (q) => q.eq('callId', callId))
    .collect()
  for (const participant of participants) {
    await ctx.db.delete('call_participants', participant._id)
  }
}

export async function deleteCallRtcMessages(ctx: MutationCtx, callId: Id<'calls'>) {
  const rtcMessages = await ctx.db
    .query('call_rtc_messages')
    .withIndex('by_call', (q) => q.eq('callId', callId))
    .collect()
  for (const message of rtcMessages) {
    await ctx.db.delete('call_rtc_messages', message._id)
  }
}

export async function deleteCall(ctx: MutationCtx, callId: Id<'calls'>) {
  const call = await ctx.db.get(callId)
  if (call) {
    await deleteCallParticipants(ctx, callId)
    await deleteCallRtcMessages(ctx, callId)
    await ctx.db.delete(callId)
  }
}

export async function createNewCallWithCleanup(
  ctx: MutationCtx,
  args: { fromUserId: Id<'users'>; toUserId: Id<'users'>; x: number; y: number },
) {
  const user = await ctx.db.get(args.fromUserId)
  if (!user) throw new Error('User not found')

  const myCallParticipant = await getMyCurrentActiveParticipant(ctx)
  if (myCallParticipant) throw new Error('You are already on call')

  const existingCallParticipant = await getActiveParticipantByUser(ctx, args.toUserId)
  if (existingCallParticipant) throw new Error('User is already on call')

  await createNewCall(ctx, args)
}

export async function createNewCall(
  ctx: MutationCtx,
  args: { fromUserId: Id<'users'>; toUserId: Id<'users'>; x: number; y: number },
) {
  const newCallId = await ctx.db.insert('calls', {
    fromUserId: args.fromUserId,
    toUserId: args.toUserId,
    status: 'preparing',
  })
  await ctx.db.insert('call_participants', {
    callId: newCallId,
    userId: args.fromUserId,
    audio: false,
    video: false,
    role: 'host',
    status: 'joined',
  })
  await FloatingPanels.createNewPanel(ctx, {
    x: args.x,
    y: args.y,
    type: 'rtc',
    callId: newCallId,
    userId: args.fromUserId,
  })
}

export async function getRtcMessageReceiver(ctx: QueryCtx | MutationCtx, type: Doc<'call_rtc_messages'>['type']) {
  const user = await Users.getCurrentUser(ctx)
  const call = await getMyCurrentCall(ctx)

  if (type === 'offer') return call.call.toUserId
  if (type === 'answer') return call.call.fromUserId
  return call.call.fromUserId === user._id ? call.call.toUserId : call.call.fromUserId
}

export async function deleteRtcOfferIfExists(ctx: MutationCtx, callId: Id<'calls'>) {
  const existingOffer = await ctx.db
    .query('call_rtc_messages')
    .withIndex('by_call_type', (q) => q.eq('callId', callId).eq('type', 'offer'))
    .unique()
  if (existingOffer) {
    await ctx.db.delete('call_rtc_messages', existingOffer._id)
  }
}
