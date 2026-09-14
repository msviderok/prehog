import { v } from 'convex/values'

export const sceneSchema = v.union(
  v.literal('main'),
  v.literal('tour'),
  v.literal('application'),
  v.literal('pet'),
  v.literal('personal'),
)
