import { DndProvider } from '@/components/DndProvider'
import { GlobalStateProvider } from '@/components/GlobalStateContext'
import { MainContainer } from '@/components/MainContainer'
import { MainScene } from '@/components/MainScene'
import { Player } from '@/components/Player'
import { useConvexClerkAuth } from '@/lib/integrations/convex-clerk'
import { cn } from '@/lib/utils'
import { createFileRoute } from '@tanstack/solid-router'
import { ClerkLoading, SignedIn, SignedOut, SignIn } from 'clerk-solidjs-tanstack-start'

export const Route = createFileRoute('/')({
  component: Home,
})

function Home() {
  const { isAuthenticated } = useConvexClerkAuth()
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
          <DndProvider>
            <MainContainer>
              <MainScene />
              <Player />
            </MainContainer>
          </DndProvider>
        </GlobalStateProvider>
      </SignedIn>
      <ClerkLoading>
        <p>Still loading</p>
      </ClerkLoading>
    </main>
  )
}
