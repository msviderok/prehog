import { MainScene } from '@/components/scenes/MainScene'
import { createFileRoute } from '@tanstack/solid-router'
import { onCleanup, onMount, type ParentProps } from 'solid-js'
import { createStore } from 'solid-js/store'

export const Route = createFileRoute('/')({ component: Home })

export default function Home() {
  return (
    <main class="h-screen w-screen flex items-center">
      <MainContainer>
        <MainScene />
      </MainContainer>
    </main>
  )
}

function MainContainer(props: ParentProps<{}>) {
  let ref!: HTMLDivElement
  const [coords, setCoords] = createStore({ x: 0, y: 0, width: 0, height: 0, x2: 0, y2: 0, scale: 1 })

  onMount(() => {
    const rect = ref.getBoundingClientRect()

    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (window.innerHeight < entry.target.scrollHeight) {
          setCoords('scale', window.innerHeight / entry.target.scrollHeight)
        }
      }
    })

    setCoords({
      x: rect.left,
      y: rect.top,
      width: rect.width,
      height: rect.height,
      x2: rect.left + rect.width,
      y2: rect.top + rect.height,
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
