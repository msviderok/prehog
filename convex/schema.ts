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
    isOnline: v.boolean(),
    fullname: v.string(),
    avatar: v.optional(v.string()),
  }).index('by_clerkId', ['externalId']),
  chats: defineTable({}),
  chat_members: defineTable({
    chatId: v.id('chats'),
    userId: v.id('users'),
    itTyping: v.boolean(),
  })
    .index('by_user', ['userId'])
    .index('by_chat', ['chatId'])
    .index('by_chat_user', ['chatId', 'userId']),
  chat_messages: defineTable({
    chatId: v.id('chats'),
    chatMemberId: v.id('chat_members'),
    body: v.string(),
  })
    .index('by_chat', ['chatId'])
    .index('by_chatMember', ['chatMemberId']),
})
