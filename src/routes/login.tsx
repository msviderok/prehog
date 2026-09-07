import { createFileRoute } from '@tanstack/solid-router'
import { SignIn } from 'clerk-solidjs-tanstack-start'

export const Route = createFileRoute('/login')({
  staticData: { scene: null },
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div class="flex items-center justify-center size-full">
      <SignIn />
    </div>
  )
}
