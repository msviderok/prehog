import { env } from '@/env'
import { createServerFn } from '@tanstack/solid-start'
import { auth, clerkClient } from 'clerk-solidjs-tanstack-start/server'
import * as v from 'valibot'
import { hasConvexAudience } from './utils'

export const authClerkServerFn = createServerFn().handler(async () => {
  const user = await auth()
  const token = await user.getToken({ template: 'convex' })
  return token && hasConvexAudience(token) ? { token, sessionId: user.sessionId!, userId: user.userId! } : null
})

export const clerkSignOutServerFn = createServerFn({ method: 'POST' })
  .validator(v.string())
  .handler(async ({ data: sessionId }) => {
    clerkClient({ secretKey: env.CLERK_SECRET_KEY }).sessions.revokeSession(sessionId)
  })
