import { For, onMount, Show, type ParentProps } from 'solid-js'
import { useGlobalState } from '../GlobalStateContext'
import { SceneNodes } from './SceneNodes'

export function MainScene(props: ParentProps<{}>) {
  const { setSceneState, sceneState, debug } = useGlobalState()

  onMount(() => {
    const sceneRect = sceneState.ref.getBoundingClientRect()
    setSceneState({ originalWidth: sceneRect.width, originalHeight: sceneRect.height })
  })

  return (
    <div
      ref={(el) => setSceneState('ref', el)}
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
      <Show when={debug()}>
        <XYNodes />
      </Show>

      <SceneNodes />
      {props.children}
    </div>
  )
}

function XYNodes() {
  const { sceneState } = useGlobalState()
  return (
    <For each={sceneState.nodes}>
      {(i) => {
        const x = () => i.x * sceneState.realSceneSize.width
        const y = () => i.y * sceneState.realSceneSize.height
        const size = () => sceneState.worldUnit.y * 1.5
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
