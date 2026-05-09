import { cn } from '@/lib/utils'
import { createMemo, Index, type JSX } from 'solid-js'
import { Dynamic } from 'solid-js/web'
import { useGlobalState } from './GlobalStateContext'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'

const DEBUG = false

const NodeComponent: Record<Scene.Node['type'], (props: Scene.Node) => JSX.Element> = {
  popover: NodePopover,
}

export function SceneNodes() {
  const { nodes } = useGlobalState()
  return <Index each={nodes}>{(node) => <Dynamic component={NodeComponent[node().type]} {...node()} />}</Index>
}

function NodePopover(props: Scene.NodePopover) {
  const { sceneState, setNodes } = useGlobalState()
  const realCoords = createMemo(() => ({
    x: props.x * sceneState.realSceneSize.width,
    y: props.y * sceneState.realSceneSize.height,
  }))
  const realTriggerBoxCoords = createMemo<Pick<JSX.CSSProperties, 'transform' | 'width' | 'height'>>(() => {
    const x1 = props.hitbox.left * sceneState.realSceneSize.width
    const y1 = props.hitbox.top * sceneState.realSceneSize.height
    const x2 = props.hitbox.right * sceneState.realSceneSize.width
    const y2 = props.hitbox.bottom * sceneState.realSceneSize.height
    return {
      transform: `translate3d(${x1}px, ${y1}px, 0)`,
      width: `${x2 - x1}px`,
      height: `${y2 - y1}px`,
    }
  })

  return (
    <>
      <span
        class={cn('absolute top-0 left-0', DEBUG && 'border-2 border-purple-500')}
        style={realTriggerBoxCoords()}
        ref={(el) => setNodes(props.idx, 'ref', el)}
      />
      <Popover open>
        <PopoverTrigger
          render={{
            component: 'span',
            class: 'absolute top-0 left-0',
            style: { transform: `translate3d(${realCoords().x}px, ${realCoords().y}px, 0)` },
          }}
        />
        <PopoverContent
          portalContainerRef={sceneState.ref}
          {...props.positioner}
          class={cn('opacity-0', props.open && 'opacity-100')}
        >
          {props.text}
        </PopoverContent>
      </Popover>
    </>
  )
}
