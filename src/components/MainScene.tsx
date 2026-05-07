import { onMount, type ParentProps } from 'solid-js'
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
      {props.children}
    </div>
  )
}
