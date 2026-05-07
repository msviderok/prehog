import { For, onMount, type ParentProps } from 'solid-js'
import { useGlobalState } from './GlobalStateContext'

export function MainScene(props: ParentProps<{}>) {
  const { setSceneSettings, sceneSettings } = useGlobalState()

  onMount(() => {
    const sceneRect = sceneSettings.ref.getBoundingClientRect()
    setSceneSettings({ originalWidth: sceneRect.width, originalHeight: sceneRect.height })
  })

  return (
    <div
      ref={(el) => setSceneSettings('ref', el)}
      class="relative shrink-0 overflow-hidden origin-top-left [image-rendering:pixelated]"
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
      <For each={sceneSettings.nodes}>
        {(i) => {
          const x = () => i.x * sceneSettings.realSceneSize.width
          const y = () => i.y * sceneSettings.realSceneSize.height
          return (
            <span
              data-node={JSON.stringify({ x: x(), y: y() })}
              class="absolute top-0 left-0 size-4 -translate-1/2 rounded-2xl bg-red-500 border-2 border-blue-500 cursor-pointer"
              style={{
                transform: `translate3d(${x()}px,${y()}px,0)`,
              }}
            />
          )
        }}
      </For>
      {props.children}
    </div>
  )
}
