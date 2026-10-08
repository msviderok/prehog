import { Popover as PopoverPrimitive } from '@msviderok/base-ui-solid/popover'
import { cn } from 'cn'
import { onCleanup, type ParentProps } from 'solid-js'
import { useGlobalState } from '../GlobalStateContext'
import { useInteractiveNode } from './context'

export function Anchor(props: {
  x: number
  y: number
  side?: PopoverPrimitive.Positioner.Props['side']
  align?: PopoverPrimitive.Positioner.Props['align']
}) {
  const { id, node } = useInteractiveNode<'popover'>()
  const { registerSlot, unregisterSlot } = useGlobalState()

  node.data.positioner = { side: props.side, align: props.align }

  registerSlot(id, 'popoverAnchor', () => (
    <PopoverPrimitive.Trigger
      ref={node.data.anchorRef}
      data-slot="popover-trigger"
      render="div"
      style={{ '--node-anchor-x': `${props.x}`, '--node-anchor-y': `${props.y}` }}
      class={cn(`
        absolute top-0 left-0 game-transform
        [--tx:calc(var(--scene-tx)+var(--node-anchor-x)*var(--wux))]
        [--ty:calc(var(--node-anchor-y)*var(--wuy))]
      `)}
    />
  ))

  onCleanup(() => unregisterSlot(id, 'popoverAnchor'))
  return null
}

export function Content(props: ParentProps) {
  const { id } = useInteractiveNode()
  const { registerSlot, unregisterSlot } = useGlobalState()
  registerSlot(id, 'popoverContent', () => <>{props.children}</>)
  onCleanup(() => unregisterSlot(id, 'popoverContent'))
  return null
}
