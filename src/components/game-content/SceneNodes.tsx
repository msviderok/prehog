import { cn } from '@/lib/utils'
import { createMemo, Index, type JSX } from 'solid-js'
import { Dynamic } from 'solid-js/web'
import { useGlobalState } from '../global-state/GlobalStateContext'
import { Popover, PopoverArrow, PopoverContent, PopoverTrigger } from '../ui/popover'
import type { SceneNode } from '@/components/global-state/createSceneState'

const DEBUG = false

const NodeComponent: Record<SceneNode['type'], (props: SceneNode) => JSX.Element> = {
  popover: NodePopover,
}

export function SceneNodes() {
  const { scene } = useGlobalState()
  return (
    <Index each={scene.state.nodes}>{(node) => <Dynamic component={NodeComponent[node().type]} {...node()} />}</Index>
  )
}

function NodePopover(props: SceneNode) {
  const { scene } = useGlobalState()
  const realCoords = createMemo(() => ({
    x: props.x * scene.state.realSceneSize.width,
    y: props.y * scene.state.realSceneSize.height,
  }))
  const realTriggerBoxCoords = createMemo<Pick<JSX.CSSProperties, 'transform' | 'width' | 'height'>>(() => {
    const x1 = props.hitbox.left * scene.state.realSceneSize.width
    const y1 = props.hitbox.top * scene.state.realSceneSize.height
    const x2 = props.hitbox.right * scene.state.realSceneSize.width
    const y2 = props.hitbox.bottom * scene.state.realSceneSize.height
    return {
      transform: `translate3d(${x1}px, ${y1}px, 0)`,
      width: `${x2 - x1}px`,
      height: `${y2 - y1}px`,
    }
  })

  const contentStyle = createMemo<Pick<JSX.CSSProperties, 'transform-origin'>>(() => {
    const { align, side } = props.positioner

    switch (true) {
      case side === 'top' && align === 'start':
        return { 'transform-origin': 'bottom left' }
      case side === 'left' && align === 'end':
        return { 'transform-origin': 'bottom right' }
      case side === 'right' && align === 'center':
        return { 'transform-origin': 'left' }
      case side === 'top' && align === 'end':
        return { 'transform-origin': 'bottom right' }
      case side === 'left' && align === 'start':
        return { 'transform-origin': 'top right' }
      case side === 'bottom' && align === 'end':
        return { 'transform-origin': 'top right' }
      default:
        return { 'transform-origin': 'center center' }
    }
  })

  return (
    <>
      <span
        class={cn('absolute top-0 left-0', DEBUG && 'border-2 border-purple-500')}
        style={realTriggerBoxCoords()}
        ref={(el) => {
          scene.setState('nodes', props.idx, 'ref', el)
        }}
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
          variant="scenery"
          portalContainerRef={scene.state.ref}
          {...props.positioner}
          style={contentStyle()}
          class={cn('opacity-0 scale-0', props.open && 'opacity-100 scale-100 duration-200 delay-100 ease-out')}
        >
          <PopoverArrow />
          {props.text}
        </PopoverContent>
      </Popover>
    </>
  )
}
