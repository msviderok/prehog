import { GameContent } from '@/components/game-content/GameContent'
import { GameUI } from '@/components/game-ui/GameUI'
import { GlobalStateProvider } from '@/components/GlobalStateContext'
import { createFileRoute, redirect } from '@tanstack/solid-router'
import { auth } from 'clerk-solidjs-tanstack-start/server'

export const Route = createFileRoute('/')({
  beforeLoad: async () => {
    const clerkAuth = await auth()
    if (!clerkAuth.userId) {
      throw redirect({ to: '/login' })
    }
  },
  component() {
    return (
      <main class="h-screen w-screen max-w-screen max-h-screen min-w-screen min-h-screen flex items-center overflow-hidden">
        <GlobalStateProvider>
          <GameContent />
          <GameUI />
        </GlobalStateProvider>
      </main>
    )
  },
})
