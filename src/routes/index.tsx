import { MainScene } from '@/components/scenes/MainScene'
import { useConvexClerkAuth } from '@/integrations/convex/convex-clerk'
import { cn, scaleToFit } from '@/lib/utils'
import { createFileRoute } from '@tanstack/solid-router'
import { ClerkLoading, SignedIn, SignedOut, SignIn } from 'clerk-solidjs-tanstack-start'
import { onCleanup, onMount, type ParentProps } from 'solid-js'
import { createStore } from 'solid-js/store'

export const Route = createFileRoute('/')({
  component: Home,
})

function Home() {
  const user = useConvexClerkAuth()

  return (
    <main class={cn('h-screen w-screen flex items-center', user.isAuthenticated() === false && 'justify-center')}>
      <SignedOut>
        <SignIn />
      </SignedOut>
      <SignedIn>
        <MainContainer>
          <MainScene />
        </MainContainer>
      </SignedIn>
      <ClerkLoading>
        <p>Still loading</p>
      </ClerkLoading>
    </main>
  )
}

function MainContainer(props: ParentProps<{}>) {
  let ref!: HTMLDivElement
  const [coords, setCoords] = createStore({ x: 0, y: 0, width: 0, height: 0, x2: 0, y2: 0, scale: 1 })

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
