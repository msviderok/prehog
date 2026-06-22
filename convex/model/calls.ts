import { Doc, Id } from '../_generated/dataModel'
import { type MutationCtx, type QueryCtx } from '../_generated/server'
import * as Users from './users'
import * as FloatingPanels from './floatingPanels'

async function findCall(ctx: QueryCtx | MutationCtx, userId: Id<'users'>) {
  const call = await ctx.db
    .query('calls')
    .filter((p) => p.or(p.eq(p.field('fromUserId'), userId), p.eq(p.field('toUserId'), userId)))
    .unique()
  return call
}

async function listParticipants(ctx: QueryCtx | MutationCtx, callId: Id<'calls'>) {
  const participants = await ctx.db
    .query('call_participants')
    .withIndex('by_call', (q) => q.eq('callId', callId))
    .collect()
  return participants
}

export async function findMyCurrentCall(ctx: QueryCtx | MutationCtx) {
  const user = await Users.getCurrentUser(ctx)
  const call = await findCall(ctx, user._id)
  if (!call) return null

  const isHost = call.fromUserId === user._id
  const isParticipant = call.toUserId === user._id
  const theirUser = await ctx.db.get('users', isHost ? call.toUserId : call.fromUserId)
  if (!theirUser) return null

  const participants = await listParticipants(ctx, call._id)
  const myParticipant = participants.find((p) => p.userId === user._id)
  if (!myParticipant) return null

  const theirParticipant = participants.find((p) => p._id !== myParticipant._id)
  return { call, user, myParticipant, theirUser, theirParticipant, isHost, isParticipant }
}

/** @throws */
export async function getMyCurrentCall(ctx: QueryCtx | MutationCtx) {
  const user = await Users.getCurrentUser(ctx)
  const call = await findCall(ctx, user._id)
  if (!call) throw new Error('Call not found')

  const isHost = call.fromUserId === user._id
  const isParticipant = call.toUserId === user._id
  const theirUser = await ctx.db.get('users', isHost ? call.toUserId : call.fromUserId)
  if (!theirUser) throw new Error('Their user not found')

  const participants = await listParticipants(ctx, call._id)
  const myParticipant = participants.find((p) => p.userId === user._id)
  if (!myParticipant) throw new Error('My participant not found')

  const theirParticipant = participants.find((p) => p._id !== myParticipant._id)
  return { call, user, myParticipant, theirUser, theirParticipant, isHost, isParticipant }
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

async function deleteCallParticipants(ctx: MutationCtx, callId: Id<'calls'>) {
  const participants = await ctx.db
    .query('call_participants')
    .withIndex('by_call', (q) => q.eq('callId', callId))
    .collect()
  for (const participant of participants) {
    await ctx.db.delete('call_participants', participant._id)
  }
}

async function deleteCallRtcMessages(ctx: MutationCtx, callId: Id<'calls'>) {
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

export async function isCurrentCallEstablished(ctx: QueryCtx | MutationCtx) {
  const call = await findMyCurrentCall(ctx)

  if (!call) return false
  if (call.call.status !== 'in-progress') return false

  const messages = await ctx.db
    .query('call_rtc_messages')
    .withIndex('by_call', (q) => q.eq('callId', call.call._id))
    .collect()

  const offerClaimed = messages.find((message) => message.type === 'offer' && message.claimed)
  const answerClaimed = messages.find((message) => message.type === 'answer' && message.claimed)
  return !!(offerClaimed && answerClaimed)
}
