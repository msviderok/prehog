import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

export const userEvent = v.union(
  v.object({
    type: v.literal('move'),
    x: v.number(),
    y: v.number(),
    timeSinceLastBatch: v.number(),
  }),
)

export default defineSchema({
  users: defineTable({
    // this the Clerk ID, stored in the subject JWT field
    externalId: v.string(),
    eventBatches: v.array(userEvent),
  }).index('by_externalId', ['externalId']),
})
