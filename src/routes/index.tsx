import { DndProvider } from '@/components/DndProvider'
import { GlobalStateProvider } from '@/components/GlobalStateContext'
import { MainContainer } from '@/components/MainContainer'
import { MainScene } from '@/components/MainScene'
import { Player } from '@/components/Player'
import { useConvexClerkAuth } from '@/lib/integrations/convex-clerk'
import { cn } from '@/lib/utils'
import { createFileRoute } from '@tanstack/solid-router'
import { ClerkLoading, SignedIn, SignedOut, SignIn } from 'clerk-solidjs-tanstack-start'
import { useMutation } from 'convex-solidjs'
import { createEffect, onCleanup, onMount } from 'solid-js'
import { api } from '../../convex/_generated/api'
import { env } from '@/env'

export const Route = createFileRoute('/')({
  component: Home,
})

function Home() {
  const { isAuthenticated } = useConvexClerkAuth()
  const setMyOnline = useMutation(api.users.setMyOnline)

  createEffect(() => {
    if (isAuthenticated()) {
      void setMyOnline.mutate({ isOnline: true })
    }
  })

  onCleanup(() => {
    void setMyOnline.mutate({ isOnline: false })
  })

  onMount(() => {
    function onLeave() {
      void setMyOnline.mutate({ isOnline: document.visibilityState === 'visible' })
    }
    function onBeforeUnload() {
      void setMyOnline.mutate({ isOnline: false })
    }

    window.addEventListener('beforeunload', onBeforeUnload)
    document.addEventListener('visibilitychange', onLeave)
    onCleanup(() => {
      window.removeEventListener('beforeunload', onBeforeUnload)
      document.removeEventListener('visibilitychange', onLeave)
    })
  })

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
