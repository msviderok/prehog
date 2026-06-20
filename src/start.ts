import { createStart } from '@tanstack/solid-start'
import { clerkMiddleware } from 'clerk-solidjs-tanstack-start/server'

export const startInstance = createStart(() => {
  return {
    requestMiddleware: [clerkMiddleware()],
  }
})
