import { LoadingClerk } from '@/routes/_authed/-components/Loading'
import { createFileRoute, Outlet } from '@tanstack/solid-router'

export const Route = createFileRoute('/_authed/')({
  staticData: { scene: null },
  pendingComponent: LoadingClerk,
  component: Outlet,
})
