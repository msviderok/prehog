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
  args: {},
  handler: async (ctx) => {
    const call = await Calls.findMyCurrentCall(ctx)
    return call?.call ?? null
  },
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
  args: {},
  handler: async (ctx) => {
    const { call } = await Calls.getMyCurrentCall(ctx)
    await FloatingPanels.deletePanelsForCall(ctx, call._id)
    await Calls.deleteCall(ctx, call._id)
  },
})

// Guest only
export const reject = mutation({
  args: {},
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

export const accept = mutation({
  args: {},
  handler: async (ctx) => {
    const { call, myParticipant } = await Calls.getMyCurrentCall(ctx)
    await ctx.db.patch('calls', call._id, { status: 'in-progress', startedAt: Date.now() })
    await ctx.db.patch('call_participants', myParticipant._id, { status: 'joined', audio: true })
  },
})

export const end = mutation({
  args: {},
  handler: async (ctx) => {
    const { call, myParticipant } = await Calls.getMyCurrentCall(ctx)

    /**
     * First, delete all the floating panels related to this call as those are
     * dependent on the current active call data so we do this to prevent data
     * being fetched for the call that doesn't exist anymore.
     */
    const panels = await ctx.db
      .query('floating_panels')
      .withIndex('by_call', (q) => q.eq('callId', call._id))
      .collect()
    await Promise.all(panels.map((p) => FloatingPanels.deletePanel(ctx, p)))

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

export const findParticipantUser = query({
  args: {},
  handler: async (ctx) => {
    const call = await Calls.findMyCurrentCall(ctx)
    if (!call) return null
    const user = await ctx.db.get(
      'users',
      call.myParticipant.role === 'host' ? call.call.toUserId : call.call.fromUserId,
    )
    return user
  },
})

export const myCallState = query({
  args: {},
  handler: async (ctx) => {
    const call = await Calls.findMyCurrentCall(ctx)
    return call?.myParticipant ?? null
  },
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
    console.log('sendRtcMessage', args.type)
    const call = await Calls.getMyCurrentCall(ctx)
    const toUserId = await Calls.getRtcMessageReceiver(ctx, args.type)

    if (args.type === 'offer') {
      /**
       * If an offer is sent – cleanup all the potential existing messages for this call.
       *
       * Off the top of my head, one scenario when this can happen is if for some reason
       * any user reloaded the page and some message in the offer/answer/candidate chain
       * got removed before being processed. In that case we need to re-initiate the whole
       * handshake process all over again so we need to cleanup existing messages.
       */
      await Calls.deleteCallRtcMessages(ctx, call.call._id)
    } else if (args.type === 'answer') {
      /**
       * Answer can be sent by the invitee only if the offer was received so at this point
       * that can be presumed and we can safely delete the offer from the db.
       */
      await Calls.deleteRtcOfferIfExists(ctx, call.call._id)
    }

    await ctx.db.insert('call_rtc_messages', { callId: call.call._id, toUserId, ...args })
  },
})

export const offerRtcMessage = query({
  args: {},
  handler: async (ctx) => {
    const user = await Users.getCurrentUser(ctx)
    const call = await Calls.findMyCurrentCall(ctx)
    if (!call) return null
    const offer = await ctx.db
      .query('call_rtc_messages')
      .withIndex('by_toUser_call_type', (q) =>
        q.eq('toUserId', user._id).eq('callId', call.call._id).eq('type', 'offer'),
      )
      .unique()
    return offer as CallRtcMessageOffer
  },
})

export const answerRtcMessage = query({
  args: {},
  handler: async (ctx) => {
    const user = await Users.getCurrentUser(ctx)
    const call = await Calls.findMyCurrentCall(ctx)
    if (!call) return null
    const answer = await ctx.db
      .query('call_rtc_messages')
      .withIndex('by_toUser_call_type', (q) =>
        q.eq('toUserId', user._id).eq('callId', call.call._id).eq('type', 'answer'),
      )
      .unique()
    return answer as CallRtcMessageAnswer
  },
})

export const iceCandidateRtcMessages = query({
  args: {},
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

export const deleteRtcMessage = mutation({
  args: {
    id: v.id('call_rtc_messages'),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete('call_rtc_messages', args.id)
  },
})

export const deleteRtcMessages = mutation({
  args: {
    ids: v.array(v.id('call_rtc_messages')),
  },
  handler: async (ctx, args) => {
    for (const id of args.ids) {
      await ctx.db.delete('call_rtc_messages', id)
    }
  },
})
