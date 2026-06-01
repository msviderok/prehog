import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

export const userEvent = v.union(
  v.object({
    type: v.literal('move'),
    x: v.number(),
    y: v.number(),
    timeSinceBatchStart: v.number(),
  }),
)

export default defineSchema({
  users: defineTable({
    // Clerk ID, stored in the subject JWT field
    externalId: v.string(),
    eventBatches: v.array(userEvent),
    x: v.number(),
    y: v.number(),
    fullname: v.string(),
    avatar: v.optional(v.string()),
  }).index('by_clerkId', ['externalId']),
  online: defineTable({
    userId: v.id('users'),
    isOnline: v.boolean(),
  })
    .index('by_user', ['userId'])
    .index('by_isOnline', ['isOnline']),
  chats: defineTable({}),
  chat_members: defineTable({
    chatId: v.id('chats'),
    userId: v.id('users'),
  })
    .index('by_user', ['userId'])
    .index('by_chat', ['chatId'])
    .index('by_chat_user', ['chatId', 'userId']),
  chat_messages: defineTable({
    chatId: v.id('chats'),
    userId: v.id('users'),
    body: v.string(),
  })
    .index('by_user', ['userId'])
    .index('by_chat', ['chatId'])
    .index('by_chat_user', ['chatId', 'userId']),
  typing: defineTable({
    userId: v.id('users'),
    chatId: v.id('chats'),
    isTyping: v.boolean(),
  }).index('by_chat_user', ['chatId', 'userId']),
  floating_panels: defineTable({
    type: v.union(v.literal('chat'), v.literal('rtc')),
    userId: v.id('users'),
    chatId: v.id('chats'),
    positionId: v.id('floating_panels_position'),
  })
    .index('by_user', ['userId'])
    .index('by_user_type', ['userId', 'type'])
    .index('by_user_chat', ['userId', 'chatId'])
    .index('by_user_chat_type', ['userId', 'chatId', 'type']),
  floating_panels_position: defineTable({
    x: v.number(),
    y: v.number(),
    zIndex: v.number(),
  }).index('by_layer', ['zIndex']),
})
