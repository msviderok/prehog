import { GameContent } from '@/components/game-content/GameContent'
import { GameUI } from '@/components/game-ui/GameUI'
import { GlobalStateProvider } from '@/components/GlobalStateContext'
import { useOnlineStatus } from '@/lib/hooks/useOnlineStatus'
import { useConvexClerkAuth } from '@/lib/integrations/convex-clerk'
import { cn } from '@/lib/utils'
import { createFileRoute } from '@tanstack/solid-router'
import { ClerkLoading, SignedIn, SignedOut, SignIn } from 'clerk-solidjs-tanstack-start'

export const Route = createFileRoute('/')({
  component() {
    const { isAuthenticated } = useConvexClerkAuth()
    useOnlineStatus()
    return (
      <main
        class={cn(
          'h-screen w-screen max-w-screen max-h-screen min-w-screen min-h-screen flex items-center overflow-hidden',
          isAuthenticated() === false && 'justify-center',
        )}
      >
        <SignedOut>
          <SignIn />
        </SignedOut>
        <SignedIn>
          <GlobalStateProvider>
            <GameContent />
            <GameUI />
          </GlobalStateProvider>
        </SignedIn>
        <ClerkLoading>
          <p>Still loading</p>
        </ClerkLoading>
      </main>
    )
  },
})
