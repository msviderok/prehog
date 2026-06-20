import { createFileRoute } from '@tanstack/solid-router'
import { SignIn } from 'clerk-solidjs-tanstack-start'

export const Route = createFileRoute('/login')({
  component() {
    return (
      <main class="h-screen w-screen max-w-screen max-h-screen min-w-screen min-h-screen flex items-center overflow-hidden justify-center">
        <SignIn />
      </main>
    )
  },
})
