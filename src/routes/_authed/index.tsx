import { LoadingClerk } from '@/components/Loading'
import { authServerFn } from '@/lib/server.functions'
import { createFileRoute, Outlet, redirect } from '@tanstack/solid-router'

export const Route = createFileRoute('/_authed/')({
  async beforeLoad() {
    const userId = await authServerFn()
    throw redirect({ to: userId == null ? '/login' : '/main' })
  },
  pendingComponent: LoadingClerk,
  component: Outlet,
})
