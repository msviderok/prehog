import { createServerFn } from '@tanstack/solid-start'
import { auth } from 'clerk-solidjs-tanstack-start/server'

export const authServerFn = createServerFn().handler(async () => {
  const user = await auth()
  return user.userId
})
