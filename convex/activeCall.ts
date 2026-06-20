import { v, Validator } from 'convex/values'
import { formatDurationFull } from '../src/lib/duration'
import { mutation, query } from './_generated/server'
import * as Calls from './model/calls'
import * as Chats from './model/chats'
import * as Users from './model/users'
import * as FloatingPanels from './model/floatingPanels'

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

export const hostUser = query({
  args: {},
  handler: async (ctx) => {
    const call = await Calls.findMyCurrentCall(ctx)
    if (!call) return null
    const user = await ctx.db.get(call.call.fromUserId)
    return user
  },
})

export const guestUser = query({
  args: {},
  handler: async (ctx) => {
    const call = await Calls.findMyCurrentCall(ctx)
    if (!call) return null
    const user = await ctx.db.get(call.call.toUserId)
    return user ?? null
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
    console.log('sendRtcMessage', args)
    const user = await Users.getCurrentUser(ctx)
    const call = await Calls.getMyCurrentCall(ctx)

    if (args.type === 'offer') {
      /**
       * If an offer is sent – cleanup all the potential existing messages for this call.
       *
       * Off the top of my head, one scenario when this can happen is if for some reason
       * any of the users reloaded the page and some message in the offer/answer/candidate
       * chain got removed before being processed. In that case we need to re-initiate
       * the whole handshake process all over again so we need to cleanup existing messages.
       */
      const existingMessages = await ctx.db
        .query('call_rtc_messages')
        .withIndex('by_call', (q) => q.eq('callId', call.call._id))
        .collect()
      await Promise.all(existingMessages.map((message) => ctx.db.delete('call_rtc_messages', message._id)))
    } else if (args.type === 'answer') {
      /**
       * Answer can be sent by the invitee only if the offer was received so at this point
       * that can be presumed. We should not expect anything other than the offer to be present
       * for this call. If those conditions are met – we can safely delete the offer from the db.
       */
      const existingOffer = await ctx.db
        .query('call_rtc_messages')
        .withIndex('by_call', (q) => q.eq('callId', call.call._id))
        .unique()

      if (existingOffer?.type !== 'offer') {
        throw new Error(
          `Expected only "offer" for this call to be present in the database, but got "${existingOffer?.type}" instead.
           Answer can only be sent after an offer is received.`,
        )
      }

      await ctx.db.delete('call_rtc_messages', existingOffer._id)
    } else if (args.type === 'ice-candidate') {
      /**
       * Receiving candidates requests means both offer and answer were received successfully so we can
       * safely remove the answer from the db, considering it should be the only message for this call
       * at this point.
       */
      const existingAnswer = await ctx.db
        .query('call_rtc_messages')
        .withIndex('by_call', (q) => q.eq('callId', call.call._id))
        .unique()

      if (existingAnswer?.type !== 'answer') {
        throw new Error(
          `Expected only "answer" for this call to be present in the database, but got "${existingAnswer?.type}" instead.
           ICECandidate can only be sent after an answer is received.`,
        )
      }
    }

    await ctx.db.insert('call_rtc_messages', { callId: call.call._id, toUserId: user._id, ...args })
  },
})

export const pendingRtcMessages = query({
  args: {},
  handler: async (ctx) => {
    const user = await Users.getCurrentUser(ctx)
    const call = await Calls.findMyCurrentCall(ctx)
    if (!call) return []

    const messages = await ctx.db
      .query('call_rtc_messages')
      .withIndex('by_toUser_call', (q) => q.eq('toUserId', user._id).eq('callId', call.call._id))
      .collect()
    return messages
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
