import { v, Validator } from 'convex/values'
import { formatDurationFull } from '../src/lib/duration'
import { Doc } from './_generated/dataModel'
import { mutation, query } from './_generated/server'
import * as Calls from './model/calls'
import * as Chats from './model/chats'
import * as FloatingPanels from './model/floatingPanels'
import * as Users from './model/users'

type CallRtcMessageOffer = Extract<Doc<'call_rtc_messages'>, { type: 'offer' | 'answer' }>
type CallRtcMessageAnswer = Extract<Doc<'call_rtc_messages'>, { type: 'offer' | 'answer' }>
type CallRtcMessageIceCandidate = Extract<Doc<'call_rtc_messages'>, { type: 'ice-candidate' }>

export const get = query({
  handler: async (ctx) => (await Calls.findMyCurrentCall(ctx))?.call ?? null,
})

export const start = mutation({
  args: {
    audio: v.boolean(),
    video: v.boolean(),
  },
  handler: async (ctx, args) => {
    const { call, myParticipant } = await Calls.getMyCurrentCall(ctx)
    await ctx.db.patch(call._id, { status: 'awaiting-response' })
    await ctx.db.patch(myParticipant._id, { audio: args.audio, video: args.video })
    await ctx.db.insert('call_participants', {
      callId: call._id,
      audio: false,
      video: false,
      role: 'participant',
      status: 'invited',
      userId: call.toUserId,
    })
    await FloatingPanels.createNewPanel(ctx, {
      type: 'rtc',
      callId: call._id,
      userId: call.toUserId,
      x: 0,
      y: 0,
    })
  },
})

export const cancel = mutation({
  handler: async (ctx) => {
    const { call } = await Calls.getMyCurrentCall(ctx)
    await FloatingPanels.deletePanelsForCall(ctx, call._id)
    await Calls.deleteCall(ctx, call._id)
  },
})

export const accept = mutation({
  handler: async (ctx) => {
    const { call, myParticipant } = await Calls.getMyCurrentCall(ctx)
    await ctx.db.patch('calls', call._id, { status: 'in-progress', startedAt: Date.now() })
    await ctx.db.patch('call_participants', myParticipant._id, { status: 'joined', audio: true })
  },
})

// Guest only
export const reject = mutation({
  handler: async (ctx) => {
    const { call, myParticipant } = await Calls.getMyCurrentCall(ctx)

    /**
     * First, delete all the floating panels related to this call as those are
     * dependent on the current active call data so we do this to prevent data
     * being fetched for the call that doesn't exist anymore.
     */
    await FloatingPanels.deletePanelsForCall(ctx, call._id)

    // insert a system message into the chat to have a record about the call
    const chatter = myParticipant.role === 'host' ? call.toUserId : call.fromUserId
    const chat = await Chats.getDirectChatWithUser(ctx, chatter)
    if (!chat) throw new Error('No chat found')

    await ctx.db.insert('chat_messages', {
      type: 'system',
      chatId: chat._id,
      body: { type: 'call', status: 'declined' },
      userId: call.fromUserId,
    })

    // delete the call
    await Calls.deleteCall(ctx, call._id)
  },
})

export const end = mutation({
  handler: async (ctx) => {
    const { call, myParticipant } = await Calls.getMyCurrentCall(ctx)

    /**
     * First, delete all the floating panels related to this call as those are
     * dependent on the current active call data so we do this to prevent data
     * being fetched for the call that doesn't exist anymore.
     */
    await FloatingPanels.deletePanelsForCall(ctx, call._id)

    // insert a system message into the chat to have a record about the call
    const chatter = myParticipant.role === 'host' ? call.toUserId : call.fromUserId
    const chat = await Chats.getDirectChatWithUser(ctx, chatter)
    if (!chat) throw new Error('No chat found')
    await ctx.db.insert('chat_messages', {
      type: 'system',
      chatId: chat._id,
      body: { type: 'call', status: 'ended', duration: formatDurationFull(call.startedAt!, Date.now()) },
      userId: call.fromUserId,
    })

    // delete the call
    await Calls.deleteCall(ctx, call._id)
  },
})

export const toggleAudio = mutation({
  args: {
    audio: v.boolean(),
  },
  handler: async (ctx, args) => {
    const { myParticipant } = await Calls.getMyCurrentCall(ctx)
    await ctx.db.patch(myParticipant._id, { audio: args.audio })
  },
})

export const toggleVideo = mutation({
  args: {
    video: v.boolean(),
  },
  handler: async (ctx, args) => {
    const { myParticipant } = await Calls.getMyCurrentCall(ctx)
    await ctx.db.patch(myParticipant._id, { video: args.video })
  },
})

export const status = query({
  handler: async (ctx) => (await Calls.getMyCurrentCall(ctx)).call.status,
})

export const startedAt = query({
  handler: async (ctx) => (await Calls.getMyCurrentCall(ctx)).call.startedAt,
})

export const findMyParticipant = query({
  handler: async (ctx) => (await Calls.findMyCurrentCall(ctx))?.myParticipant ?? null,
})

export const findTheirParticipant = query({
  handler: async (ctx) => (await Calls.findMyCurrentCall(ctx))?.theirParticipant ?? null,
})

export const findTheirUser = query({
  handler: async (ctx) => (await Calls.findMyCurrentCall(ctx))?.theirUser,
})

export const myAudio = query({
  handler: async (ctx) => (await Calls.findMyCurrentCall(ctx))?.myParticipant?.audio ?? false,
})

export const myVideo = query({
  handler: async (ctx) => (await Calls.findMyCurrentCall(ctx))?.myParticipant?.video ?? false,
})

export const theirAudio = query({
  handler: async (ctx) => (await Calls.findMyCurrentCall(ctx))?.theirParticipant?.audio ?? false,
})

export const theirVideo = query({
  handler: async (ctx) => (await Calls.findMyCurrentCall(ctx))?.theirParticipant?.video ?? false,
})

export const sendRtcMessage = mutation({
  args: {
    message: v.union(
      v.object({
        type: v.union(v.literal('offer'), v.literal('answer')),
        data: v.record(v.string(), v.any()) as Validator<RTCSessionDescriptionInit>,
      }),
      v.object({
        type: v.literal('ice-candidate'),
        data: v.record(v.string(), v.any()) as Validator<RTCIceCandidateInit>,
      }),
    ),
  },
  handler: async (ctx, { message: args }) => {
    const call = await Calls.getMyCurrentCall(ctx)
    const toUserId = await Calls.getRtcMessageReceiver(ctx, args.type)
    await ctx.db.insert('call_rtc_messages', { callId: call.call._id, claimed: false, toUserId, ...args })
  },
})

export const claimRtcMessage = mutation({
  args: {
    ids: v.union(v.id('call_rtc_messages'), v.array(v.id('call_rtc_messages'))),
  },
  handler: async (ctx, args) => {
    const ids = Array.isArray(args.ids) ? args.ids : [args.ids]
    for (const id of ids) {
      await ctx.db.patch('call_rtc_messages', id, { claimed: true })
    }
  },
})

export const canSendOfferRtcMessage = query({
  handler: async (ctx) => {
    const call = await Calls.findMyCurrentCall(ctx)
    if (!call) return false

    /* Only hosts can send offers */
    if (call.isHost === false) return false

    const existingOffer = await ctx.db
      .query('call_rtc_messages')
      .withIndex('by_call_type', (q) => q.eq('callId', call.call._id).eq('type', 'offer'))
      .unique()

    /* If the offer already exists, claimed or not – we cannot send another one. */
    if (existingOffer) return false

    /**
     * Otherwise, if there is no offer – we can only send one if the call status is in progress.
     * At this point the call being "in progress" means it just got accepted but offer was not
     * sent yet.
     */
    if (call.call.status === 'in-progress') return true
    return false
  },
})

export const canSendAnswerRtcMessage = query({
  handler: async (ctx) => {
    const call = await Calls.findMyCurrentCall(ctx)
    if (!call) return false

    /* Only participants can send answers */
    if (call.isParticipant === false) return false

    const existingAnswer = await ctx.db
      .query('call_rtc_messages')
      .withIndex('by_call_type', (q) => q.eq('callId', call.call._id).eq('type', 'answer'))
      .unique()

    /* If the answer already exists, claimed or not – we cannot send another one. */
    if (existingAnswer) return false

    const existingOffer = await ctx.db
      .query('call_rtc_messages')
      .withIndex('by_call_type', (q) => q.eq('callId', call.call._id).eq('type', 'offer'))
      .unique()

    if (!existingOffer) return false
    // if (!existingOffer) throw new Error("Answer should not be triggered if there's no offer available for this call.")

    /* If the offer is claimed – the answer was already sent, do not send another one. */
    if (existingOffer.claimed) return false

    /**
     * At this point we can send the answer only if the following conditions are met:
     *  1. There exists an offer and it is not claimed.
     *  2. There was no answer created yet.
     *  3. Current call status is "in progress". This means we've just accepted the call
     *     and this request was sent to create the first (and only) answer.
     */
    if (call.call.status === 'in-progress') return existingOffer as CallRtcMessageOffer
    return false
  },
})

export const canClaimAnswer = query({
  handler: async (ctx) => {
    const call = await Calls.findMyCurrentCall(ctx)
    if (!call) return false

    /* Only hosts can receive and claim answers */
    if (call.isHost === false) return false

    const existingAnswer = await ctx.db
      .query('call_rtc_messages')
      .withIndex('by_call_type', (q) => q.eq('callId', call.call._id).eq('type', 'answer'))
      .unique()

    /* If there is no answer then there's nothing to claim yet */
    if (!existingAnswer) return false

    /* If the answer exists but it is already claimed then nothing to claim anymore */
    if (existingAnswer.claimed) return false

    /* If there is an unclaimed answer and the call is "in progress" - send the answer to claim. */
    if (call.call.status === 'in-progress') {
      return existingAnswer as CallRtcMessageAnswer
    }

    return false
  },
})

export const iceCandidateRtcMessages = query({
  handler: async (ctx) => {
    const user = await Users.getCurrentUser(ctx)
    const call = await Calls.findMyCurrentCall(ctx)
    if (!call) return null
    const candidates = await ctx.db
      .query('call_rtc_messages')
      .withIndex('by_toUser_call_type', (q) =>
        q.eq('toUserId', user._id).eq('callId', call.call._id).eq('type', 'ice-candidate'),
      )
      .collect()
    return candidates as CallRtcMessageIceCandidate[]
  },
})

export const isCallEstablished = query({
  handler: async (ctx) => await Calls.isCurrentCallEstablished(ctx),
})
