import { Popover as PopoverPrimitive } from '@msviderok/base-ui-solid/popover'
import { cn } from 'cn'
import { onCleanup, type ParentProps } from 'solid-js'
import { useGlobalState } from '../GlobalStateContext'
import { useInteractiveNode } from './context'

export function Popover(
  props: ParentProps<{
    anchorX: number
    anchorY: number
    side?: PopoverPrimitive.Positioner.Props['side']
    align?: PopoverPrimitive.Positioner.Props['align']
  }>,
) {
  const { nodes } = useGlobalState()
  const { id, node } = useInteractiveNode<'popover'>()

  node.data.positioner = { side: props.side, align: props.align }

  nodes.registerSlot(id, 'popoverContent', () => <>{props.children}</>)
  nodes.registerSlot(id, 'popoverAnchor', () => (
    <PopoverPrimitive.Trigger
      ref={node.data.anchorRef}
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

  onCleanup(() => {
    nodes.unregisterSlot(id, 'popoverAnchor')
    nodes.unregisterSlot(id, 'popoverContent')
  })

  return null
}
