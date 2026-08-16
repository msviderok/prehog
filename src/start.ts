import { createCsrfMiddleware, createStart } from '@tanstack/solid-start'
import { clerkMiddleware } from 'clerk-solidjs-tanstack-start/server'

const csrfMiddleware = createCsrfMiddleware({ filter: (ctx) => ctx.handlerType === 'serverFn' })

export const startInstance = createStart(() => {
  return {
    defaultSsr: false,
    requestMiddleware: [csrfMiddleware, clerkMiddleware()],
  }
})
