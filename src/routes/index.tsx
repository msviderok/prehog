import { GlobalStateProvider } from '@/components/GlobalStateContext'
import { MainContainer } from '@/components/MainContainer'
import { MainScene } from '@/components/MainScene'
import { Player } from '@/components/Player'
import { useCurrentUser } from '@/lib/integrations/convex-clerk'
import { cn } from '@/lib/utils'
import { createFileRoute } from '@tanstack/solid-router'
import { ClerkLoading, SignedIn, SignedOut, SignIn } from 'clerk-solidjs-tanstack-start'

export const Route = createFileRoute('/')({
  component: Home,
})

function Home() {
  const user = useCurrentUser()

  return (
    <main
      class={cn(
        'h-screen w-screen max-w-screen max-h-screen min-w-screen min-h-screen flex items-center overflow-hidden',
        user.isAuthenticated === false && 'justify-center',
      )}
    >
      <SignedOut>
        <SignIn />
      </SignedOut>
      <SignedIn>
        <GlobalStateProvider>
          <MainContainer>
            <MainScene />
            <Player />
          </MainContainer>
        </GlobalStateProvider>
      </SignedIn>
      <ClerkLoading>
        <p>Still loading</p>
      </ClerkLoading>
    </main>
  )
}
