import { GlobalStateProvider } from '@/components/GlobalStateContext'
import { MainContainer } from '@/components/MainContainer'
import { MainScene } from '@/components/MainScene'
import { Player } from '@/components/Player'
import { useCurrentUser } from '@/integrations/convex/convex-clerk'
import { cn } from '@/lib/utils'
import { createFileRoute } from '@tanstack/solid-router'
import { ClerkLoading, SignedIn, SignedOut, SignIn } from 'clerk-solidjs-tanstack-start'
import { Show } from 'solid-js'

const DEBUG = false

export const Route = createFileRoute('/')({
  component: Home,
})

function Home() {
  const user = useCurrentUser()

  return (
    <main
      class={cn(
        'h-screen w-screen flex items-center overflow-hidden',
        user.isAuthenticated === false && 'justify-center',
      )}
    >
      <Show
        when={!DEBUG}
        fallback={
          <GlobalStateProvider>
            <MainContainer>
              <MainScene />
              <Player />
            </MainContainer>
          </GlobalStateProvider>
        }
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
      </Show>
    </main>
  )
}
