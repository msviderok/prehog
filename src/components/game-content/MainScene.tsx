import { For, onMount, Show, type ParentProps } from 'solid-js'
import { useGlobalState } from '../global-state/GlobalStateContext'
import { SceneNodes } from './SceneNodes'
import { produce } from 'solid-js/store'

export function MainScene(props: ParentProps<{}>) {
  let ref!: HTMLDivElement
  const { scene } = useGlobalState()

  onMount(() => {
    const rect = ref.getBoundingClientRect()
    scene.setState(
      produce((state) => {
        state.ref = ref
        state.originalSize = { width: rect.width, height: rect.height }
      }),
    )
  })

  return (
    <div
      ref={ref}
      class="relative shrink-0 overflow-hidden origin-top-left [image-rendering:pixelated] brightness-100"
      style={{
        width: '6043px',
        height: '1080px',
        'background-color': '#111220',
        'background-image': 'url("https://utfs.io/f/FRHd7GIa8Oy2N1cA4CqQ0oh8I3ZJzj1XcaRn6dE2kKOTlyuS")',
        'background-size': `100% 100%`,
        'background-repeat': 'no-repeat',
        'background-position': 'top left',
      }}
    >
      <Show when={false}>
        <XYNodes />
      </Show>

      <SceneNodes />
      {props.children}
    </div>
  )
}

function XYNodes() {
  const { scene } = useGlobalState()
  return (
    <For each={scene.state.nodes}>
      {(i) => {
        const x = () => i.x * scene.state.realSceneSize.width
        const y = () => i.y * scene.state.realSceneSize.height
        const size = () => scene.state.worldUnit.y * 1.5
        return (
          <span
            class="absolute top-0 left-0 -translate-1/2 rounded-2xl bg-red-500 border-2 border-blue-500 cursor-pointer"
            style={{
              transform: `translate3d(${x()}px,${y()}px,0)`,
              height: `${size()}px`,
              width: `${size()}px`,
            }}
          />
        )
      }}
    </For>
  )
}
