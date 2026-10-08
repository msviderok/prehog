import type { Assets } from '@/routeAssets.gen'
import { Popover as PopoverPrimitive } from '@msviderok/base-ui-solid/popover'
import { cn } from 'cn'
import { createEffect, on, onCleanup, type ParentProps } from 'solid-js'
import { type AssetProps, Asset as AssetOriginal } from '../Asset'
import { useGlobalState } from '../GlobalStateContext'
import { createInteractiveNode } from './-createInteractiveNode'
import { InteractiveNodeContext, useInteractiveNode } from './context'
import * as EventMarker from './EventMarker'
import { useRouter } from '@tanstack/solid-router'

export function Root(props: ParentProps<{ id: string }>) {
  const { popover } = useGlobalState()
  const node = createInteractiveNode(props.id, 'popover', { positioner: {}, anchorRef: undefined })
  createEffect(on(node.collided, (c) => popover.setActiveNode(c ? props.id : undefined)))

  return (
    <InteractiveNodeContext.Provider value={{ id: props.id, node }}>{props.children}</InteractiveNodeContext.Provider>
  )
}

export function Anchor(props: {
  x: number
  y: number
  side?: PopoverPrimitive.Positioner.Props['side']
  align?: PopoverPrimitive.Positioner.Props['align']
}) {
  const { id, node } = useInteractiveNode<'popover'>()
  const { registerSlot, unregisterSlot } = useGlobalState()

  node.data.positioner = { side: props.side, align: props.align }

  registerSlot(id, 'anchor', () => (
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

  onCleanup(() => unregisterSlot(id, 'anchor'))
  return null
}

export function Asset<K extends keyof Assets, A extends keyof Assets[K]>(props: AssetProps<K, A>) {
  const { id } = useInteractiveNode()
  const { registerSlot, unregisterSlot } = useGlobalState()
  registerSlot(id, 'asset', () => <AssetOriginal {...props} />)
  onCleanup(() => unregisterSlot(id, 'asset'))
  return null
}

export function Marker(props: ParentProps<{ x: number; y: number }>) {
  const { id } = useInteractiveNode()
  const { registerSlot, unregisterSlot } = useGlobalState()
  registerSlot(id, 'marker', () => <EventMarker.Root {...props} />)
  onCleanup(() => unregisterSlot(id, 'marker'))
  return null
}

export function Content(props: ParentProps) {
  const { id } = useInteractiveNode()
  const { registerSlot, unregisterSlot } = useGlobalState()
  registerSlot(id, 'content', () => <>{props.children}</>)
  onCleanup(() => unregisterSlot(id, 'content'))
  return null
}

export function PreloadRoute(props: { route: CurrentScene }) {
  const router = useRouter()
  const { node } = useInteractiveNode<'popover'>()

  createEffect(
    on(
      () => node.collided(),
      (isOpen) => isOpen && void router.preloadRoute({ to: `/${props.route}` }),
    ),
  )

  return null
}

// <InteractiveNodePopover.Root id="wardrobe">
//   <InteractiveNodePopover.Anchor position={{ x: 30, y: 34 }} side="top" />
//   <InteractiveNodePopover.Asset routeId="/_authed/main/" asset="building_3.png" x={24.73} y={-0.1} scale={1.475} />
//   <InteractiveNodePopover.Marker position={{ x: 29.5, y: 94 }}>
//     <EventMarker.Pill label="Explore" offsetX={-2} offsetY={-28.2} onInteract={() => start('wardrobe')} />
//     <EventMarker.PreloadRoute route="tour" />
//   </InteractiveNodePopover.Marker>
//   <InteractiveNodePopover.Interaction id="wardrobe">
//     {/* reads player.hat, W/A/S/D flips, confirm/cancel → finish() */}
//   </InteractiveNodePopover.Interaction>
//   <InteractiveNodePopover.Content>
//     <PopoverHeader><PopoverTitle>Wardrobe</PopoverTitle></PopoverHeader>
//     <PopoverDescription>You can change your clothes here – free of charge!</PopoverDescription>
//   </InteractiveNodePopover.Content>
// </InteractiveNodePopover.Root>
