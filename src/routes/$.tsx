import { createFileRoute, redirect } from '@tanstack/solid-router'

export const Route = createFileRoute('/$')({
  staticData: { scene: null },
  beforeLoad() {
    throw redirect({ to: '/' })
  },
})
