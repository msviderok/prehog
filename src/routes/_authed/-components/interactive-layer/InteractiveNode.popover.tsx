import { Popover as PopoverPrimitive } from '@msviderok/base-ui-solid/popover'
import { cn } from 'cn'
import { type ParentProps } from 'solid-js'
import { useGlobalState } from '../GlobalStateContext'
import { useInteractiveNode } from './context'
import { useSceneContext } from '../Scene.context'

export function Popover(
  props: ParentProps<{
    anchorX: number
    anchorY: number
    side?: PopoverPrimitive.Positioner.Props['side']
    align?: PopoverPrimitive.Positioner.Props['align']
  }>,
) {
  const { gameState } = useGlobalState()
  const { id, node } = useInteractiveNode<'popover'>()
  const sceneName = useSceneContext()

  node.data.popover.positioner = { side: props.side, align: props.align }

  gameState.scene(sceneName).nodes.registerSlot(id, 'popoverContent', () => <>{props.children}</>)
  gameState.scene(sceneName).nodes.registerSlot(id, 'popoverAnchor', () => (
    <PopoverPrimitive.Trigger
      ref={node.data.popover.setAnchorRef}
      data-slot="popover-trigger"
      render="div"
      style={{
        '--node-anchor-x': `${props.anchorX}`,
        '--node-anchor-y': `${props.anchorY}`,
      }}
      class={cn(`
        absolute top-0 left-0 game-transform
        [--tx:calc(var(--scene-tx)+var(--node-anchor-x)*var(--wux))]
        [--ty:calc(var(--node-anchor-y)*var(--wuy))]
      `)}
    />
  ))

  return null
}
