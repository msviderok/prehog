import { GlobalStateProvider, useGlobalState } from '@/components/GlobalStateContext'
import { MainScene } from '@/components/scenes/MainScene'
import { useCurrentUser } from '@/integrations/convex/convex-clerk'
import { createGameLoop } from '@/lib/createGameLoop'
import { createKeyboardListener } from '@/lib/createKeyboardListener'
import { cn, scaleToFit } from '@/lib/utils'
import { createFileRoute } from '@tanstack/solid-router'
import { ClerkLoading, SignedIn, SignedOut, SignIn } from 'clerk-solidjs-tanstack-start'
import { createEffect, onCleanup, onMount, Show, type ParentProps } from 'solid-js'
import { createStore } from 'solid-js/store'

const DEBUG = false

export const Route = createFileRoute('/')({
  component: Home,
})

function Home() {
  const user = useCurrentUser()

  return (
    <main class={cn('h-screen w-screen flex items-center', user.isAuthenticated === false && 'justify-center')}>
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

function Player() {
  // const me = useQuery(api.users)
  return (
    <span
      class="z-10 h-20 w-8 bg-red-500 absolute"
      style={{
        top: 0,
        left: 0,
      }}
    />
  )
}

function MainContainer(props: ParentProps<{}>) {
  let ref!: HTMLDivElement
  const [coords, setCoords] = createStore({ x: 0, y: 0, width: 0, height: 0, x2: 0, y2: 0, scale: 1 })
  const { keyPressed } = useGlobalState()

  createKeyboardListener()
  createGameLoop({
    autostart: false,
    fn: () => {},
  })

  onMount(() => {
    const rect = ref.getBoundingClientRect()

    setCoords({
      x: rect.left,
      y: rect.top,
      width: rect.width,
      height: rect.height,
      x2: rect.left + rect.width,
      y2: rect.top + rect.height,
      scale: scaleToFit(rect.height),
    })

    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (window.innerHeight < entry.target.scrollHeight) {
          setCoords('scale', scaleToFit(entry.target.scrollHeight))
        }
      }
    })

    ro.observe(ref)
    onCleanup(() => {
      ro.disconnect()
    })
  })

  return (
    <div
      ref={ref}
      class="h-screen w-screen flex items-center origin-top-left"
      style={{ transform: `scale(${coords.scale})` }}
    >
      {props.children}
    </div>
  )
}
