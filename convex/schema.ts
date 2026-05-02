import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

export default defineSchema({
  users: defineTable({
    name: v.string(),
  }),
  userProfiles: defineTable({
    tokenIdentifier: v.string(),
    subject: v.string(),
    email: v.optional(v.string()),
    name: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    updatedAt: v.number(),
  })
    .index('by_tokenIdentifier', ['tokenIdentifier'])
    .index('by_email', ['email']),
  todos: defineTable({
    text: v.string(),
    completed: v.boolean(),
  }),
})
