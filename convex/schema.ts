import { defineSchema, defineTable } from 'convex/server'
import { v, Validator } from 'convex/values'

export default defineSchema({
  users: defineTable({
    // Clerk ID, stored in the subject JWT field
    externalId: v.string(),
    fullname: v.string(),
    avatar: v.optional(v.string()),
    presenceId: v.id('presence'),
    gameEventBatchesId: v.id('game_event_batches'),
    gameUserPositionId: v.id('game_user_positions'),
    gameUserStateId: v.id('game_user_state'),
  })
    .index('by_clerkId', ['externalId'])
    .index('by_presence', ['presenceId']),
  presence: defineTable({
    isOnline: v.boolean(),
    heartbeatId: v.id('heartbeats'),
  }).index('by_online', ['isOnline']),
  heartbeats: defineTable({
    lastSeen: v.number(),
  }),
  game_user_positions: defineTable({
    x: v.number(),
  }),
  game_user_state: defineTable({
    scene: v.union(v.literal('main'), v.literal('tour'), v.literal('application')),
    movementDir: v.union(v.literal('left'), v.literal('right')),
    isWalking: v.boolean(),
    isRunning: v.boolean(),
    y: v.number(),
  }),
  game_event_batches: defineTable({
    batch: v.array(
      v.union(
        v.object({
          type: v.literal('move'),
          x: v.number(),
          t: v.number(),
        }),
      ),
    ),
  }),
  users_online_count: defineTable({
    count: v.number(),
  }),
  chats: defineTable({}),
  chat_members: defineTable({
    chatId: v.id('chats'),
    userId: v.id('users'),
    isTyping: v.boolean(),
  })
    .index('by_user', ['userId'])
    .index('by_chat', ['chatId'])
    .index('by_chat_user', ['chatId', 'userId']),
  chat_messages: defineTable(
    v.union(
      v.object({
        type: v.literal('dm'),
        chatId: v.id('chats'),
        userId: v.id('users'),
        body: v.string(),
      }),
      v.object({
        type: v.literal('system'),
        chatId: v.id('chats'),
        userId: v.id('users'),
        body: v.union(
          v.object({
            type: v.literal('call'),
            status: v.literal('declined'),
          }),
          v.object({
            type: v.literal('call'),
            status: v.literal('ended'),
            duration: v.string(),
          }),
        ),
      }),
    ),
  )
    .index('by_user', ['userId'])
    .index('by_chat', ['chatId'])
    .index('by_chat_user', ['chatId', 'userId']),
  floating_panels: defineTable(
    v.union(
      v.object({
        type: v.literal('chat'),
        userId: v.id('users'),
        chatId: v.id('chats'),
        positionId: v.id('floating_panels_position'),
      }),
      v.object({
        type: v.literal('rtc'),
        userId: v.id('users'),
        callId: v.id('calls'),
        positionId: v.id('floating_panels_position'),
      }),
    ),
  )
    .index('by_user', ['userId'])
    .index('by_call', ['callId'])
    .index('by_user_type', ['userId', 'type'])
    .index('by_user_chat', ['userId', 'chatId'])
    .index('by_user_call', ['userId', 'callId']),
  floating_panels_position: defineTable({
    x: v.number(),
    y: v.number(),
    zIndex: v.number(),
  }).index('by_layer', ['zIndex']),
  calls: defineTable({
    fromUserId: v.id('users'),
    toUserId: v.id('users'),
    status: v.union(v.literal('preparing'), v.literal('awaiting-response'), v.literal('in-progress')),
    startedAt: v.optional(v.number()),
  })
    .index('by_from', ['fromUserId'])
    .index('by_to', ['toUserId'])
    .index('by_status', ['status'])
    .index('by_from_to', ['fromUserId', 'toUserId']),
  call_participants: defineTable({
    callId: v.id('calls'),
    userId: v.id('users'),
    role: v.union(v.literal('host'), v.literal('participant')),
    status: v.optional(v.union(v.literal('invited'), v.literal('joined'))),
    audio: v.boolean(),
    video: v.boolean(),
  })
    .index('by_call', ['callId'])
    .index('by_user', ['userId'])
    .index('by_call_user', ['callId', 'userId'])
    .index('by_call_role', ['callId', 'role']),
  call_rtc_messages: defineTable(
    v.union(
      v.object({
        callId: v.id('calls'),
        toUserId: v.id('users'),
        claimed: v.boolean(),
        type: v.union(v.literal('offer'), v.literal('answer')),
        data: v.record(v.string(), v.any()) as Validator<RTCSessionDescriptionInit>,
      }),
      v.object({
        callId: v.id('calls'),
        toUserId: v.id('users'),
        claimed: v.boolean(),
        type: v.literal('ice-candidate'),
        data: v.record(v.string(), v.any()) as Validator<RTCIceCandidateInit>,
      }),
    ),
  )
    .index('by_call', ['callId'])
    .index('by_call_type', ['callId', 'type'])
    .index('by_toUser_call', ['toUserId', 'callId'])
    .index('by_toUser_call_type', ['toUserId', 'callId', 'type'])
    .index('by_toUser_call_type_claimed', ['toUserId', 'callId', 'type', 'claimed']),
})
