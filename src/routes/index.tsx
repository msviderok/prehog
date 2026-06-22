import { GameContent } from '@/components/game-content/GameContent'
import { GameUI } from '@/components/game-ui/GameUI'
import { GlobalStateProvider } from '@/components/GlobalStateContext'
import { createFileRoute, redirect } from '@tanstack/solid-router'
import { SignedIn, useAuth } from 'clerk-solidjs-tanstack-start'
import { auth } from 'clerk-solidjs-tanstack-start/server'
import { createEffect } from 'solid-js'

export const Route = createFileRoute('/')({
  beforeLoad: async () => {
    const clerkAuth = await auth()
    if (!clerkAuth.userId) {
      throw redirect({ to: '/login' })
    }
  },
  component() {
    const auth = useAuth()
    createEffect(() => {
      console.log(auth.isSignedIn())
    })
    console.log('RENDERING')
    return (
      <SignedIn>
        <main class="h-screen w-screen max-w-screen max-h-screen min-w-screen min-h-screen flex items-center overflow-hidden">
          <GlobalStateProvider>
            <GameContent />
            <GameUI />
          </GlobalStateProvider>
        </main>
      </SignedIn>
    )
  },
})
