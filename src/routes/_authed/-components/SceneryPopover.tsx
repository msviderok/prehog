import { Popover as PopoverPrimitive } from '@msviderok/base-ui-solid/popover'
import { cn } from 'cn'
import {
  createContext,
  createMemo,
  createSignal,
  For,
  onCleanup,
  onMount,
  useContext,
  type Accessor,
  type Component,
  type JSX,
  type ParentProps,
} from 'solid-js'
import { createStore, produce, type Store } from 'solid-js/store'
import { Dynamic } from 'solid-js/web'
import { EventMarker, type EventMarkerProps } from './EventMarker'
import { useGlobalState } from './GlobalStateContext'
import { PopoverArrowIcon } from '@/components/PopoverArrow'

interface PopoverItem {
  id: string
  node: SceneNodePopover
  anchor?: {
    ref: HTMLElement
    position: Coords
    component: Component
    side: PopoverPrimitive.Positioner.Props['side']
    align: PopoverPrimitive.Positioner.Props['align']
  }
  marker: {
    ref: HTMLElement
    position: Coords
    component: Component
  }
  content: { ref: HTMLElement; component: Component }
  asset: { ref: HTMLElement; component: Component }
}

interface RegistryState {
  data: Record<string, PopoverItem>
  active: { current: string | undefined; last: string | undefined }
  anchors: Component[]
  markers: Component[]
  contents: Component[]
  assets: Component[]
}

interface SceneryPopoverState {
  registry: Store<RegistryState>
  anchorRef: Accessor<HTMLElement | undefined>
  active: Accessor<PopoverItem | undefined>
  lastActive: Accessor<PopoverItem | undefined>
  register(data: PopoverItem): void
  setActive(id: string): void
  popupRef: HTMLElement
  portalRef: HTMLElement
  backdropRef: HTMLElement
  positionerRef: HTMLElement
  getNode: (id: string) => SceneNodePopover | undefined
  isOpen: (id: string) => Accessor<boolean>
}

const SceneryPopoverContext = createContext<SceneryPopoverState>()
export const SceneryPopoverNodeContext = createContext<SceneNodePopover>()

export function useSceneryPopover() {
  const ctx = useContext(SceneryPopoverContext)
  if (!ctx) throw new Error('useSceneryPopoverContext must be used within a SceneryPopoverProvider')
  return ctx
}

export function useSceneryPopoverNode() {
  const ctx = useContext(SceneryPopoverNodeContext)
  if (!ctx) throw new Error('useSceneryPopoverNode must be used within a SceneryPopoverProvider')
  return ctx
}

export function SceneryPopoverProvider(props: ParentProps) {
  let popupRef!: HTMLElement
  let portalRef!: HTMLElement
  let backdropRef!: HTMLElement
  let positionerRef!: HTMLElement
  const { nodes } = useGlobalState()
  const [registry, setRegistry] = createStore<RegistryState>({
    data: {},
    active: { current: undefined, last: undefined },
    get anchors() {
      return Object.values<PopoverItem>(this.data)
        .map((i) => i.anchor?.component)
        .filter((i) => !!i)
    },
    get markers() {
      return Object.values<PopoverItem>(this.data).map((i) => i.marker.component)
    },
    get contents() {
      return Object.values<PopoverItem>(this.data).map((i) => i.content.component)
    },
    get assets() {
      return Object.values<PopoverItem>(this.data).map((i) => i.asset.component)
    },
  })

  const active = createMemo(() => (registry.active.current ? registry.data[registry.active.current] : undefined))
  const lastActive = createMemo(() => (registry.active.last ? registry.data[registry.active.last] : undefined))

  function register(data: PopoverItem) {
    setRegistry(
      produce((draft) => {
        draft.data[data.id] = data
      }),
    )
    nodes.add(data.node)

    onCleanup(() => {
      nodes.delete(data.node)
      setRegistry(produce((draft) => delete draft.data[data.id]))
    })
  }

  function setActive(id: string) {
    setRegistry(
      produce((draft) => {
        draft.active.last = draft.active.current
        draft.active.current = id
      }),
    )
  }

  function getNode(id: string) {
    return registry.data[id]?.node
  }

  function isOpen(id: string) {
    return () => registry.data[id]?.node.actions.open.get() ?? false
  }

  const anchorRef = createMemo(() => {
    if (registry.active.current) return registry.data[registry.active.current]?.anchor?.ref
    if (registry.active.last) return registry.data[registry.active.last]?.anchor?.ref
    return undefined
  })

  const context: SceneryPopoverState = {
    registry,
    active,
    anchorRef,
    lastActive,
    register,
    setActive,
    popupRef,
    portalRef,
    backdropRef,
    positionerRef,
    getNode,
    isOpen,
  }

  return (
    <SceneryPopoverContext.Provider value={context}>
      <PopoverPrimitive.Root open={active()?.node.actions.open.get() ?? false}>{props.children}</PopoverPrimitive.Root>
    </SceneryPopoverContext.Provider>
  )
}

export function SceneryPopoverPortal() {
  const ctx = useSceneryPopover()
  const { scene } = useGlobalState()
  const currentlyRenderedElement = createMemo(() => ctx.active() ?? ctx.lastActive())

  return (
    <>
      <SceneryPopoverBackdrop />

      <For each={ctx.registry.anchors}>{(anchor) => <Dynamic component={anchor} />}</For>
      <For each={ctx.registry.assets}>{(asset) => <Dynamic component={asset} />}</For>

      <PopoverPrimitive.Portal keepMounted container={scene.ref}>
        <div class="z-1 fixed inset-0">
          <div class="absolute top-0 left-0 size-full translate-x-(--scene-tx)">
            <PopoverPrimitive.Positioner
              class="isolate z-50"
              align={currentlyRenderedElement()?.anchor?.align}
              side={currentlyRenderedElement()?.anchor?.side}
              anchor={ctx.anchorRef()}
              arrowPadding={15}
              alignOffset={0}
              sideOffset={0}
              trackAnchor={true}
              collisionAvoidance={{ align: 'none', side: 'none', fallbackAxisSide: 'none' }}
              ref={(el) => (ctx.positionerRef = el)}
            >
              <PopoverPrimitive.Popup
                data-slot="popover-content"
                ref={(el) => (ctx.popupRef = el)}
                class={cn(
                  'group z-50 rounded-lg origin-(--transform-origin) p-4 outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 transition-all bg-glass-ph-very-dark-cornflower-blue/5 text-ph-light-cornflower-blue [--arrow-offset:0px] data-starting-style:opacity-0 data-ending-style:opacity-0 data-closed:opacity-0 duration-200 ease-out border-2 [--bc:var(--ph-light-cornflower-blue)] border-(--bc) animate-pulseY delay-100',
                )}
              >
                <PopoverPrimitive.Arrow data-slot="popover-arrow">
                  <PopoverArrowIcon />
                </PopoverPrimitive.Arrow>
                <Dynamic component={currentlyRenderedElement()?.content.component} />
              </PopoverPrimitive.Popup>
            </PopoverPrimitive.Positioner>
          </div>
        </div>
      </PopoverPrimitive.Portal>
    </>
  )
}

export function SceneryPopoverBackdrop() {
  const ctx = useSceneryPopover()
  return (
    <PopoverPrimitive.Backdrop
      data-slot="popover-backdrop"
      class="fixed inset-0 bg-black opacity-0 transition-opacity data-starting-style:opacity-0 data-closed:opacity-0 data-open:opacity-50 ease-in-out"
      ref={(el) => (ctx.backdropRef = el)}
    />
  )
}

export function SceneryPopoverMarkers() {
  const ctx = useSceneryPopover()
  return <For each={ctx.registry.markers}>{(marker) => <Dynamic component={marker} />}</For>
}

export function SceneryPopover<const K extends string>(
  props: {
    id: K
    marker: { position: Coords } & EventMarkerProps
    anchor?: { position: Coords }
    asset?: Component<{ nodeId: K }>
    children?: JSX.Element
  } & Pick<PopoverPrimitive.Positioner.Props, 'side' | 'align'>,
) {
  let triggerRef!: HTMLElement
  let contentRef!: HTMLElement
  let markerRef!: HTMLElement
  let assetRef!: HTMLElement
  const ctx = useSceneryPopover()
  const [open, setOpen] = createSignal(false)

  const node: SceneNodePopover = {
    type: 'popover',
    get rootRef() {
      return markerRef
    },
    get popupRef() {
      return ctx.popupRef
    },
    get anchorPosition() {
      return props.anchor?.position
    },
    get markerPosition() {
      return props.marker.position
    },
    size: { width: 0, height: 0 },
    hitbox: { x1: 0, y1: 0, x2: 0, y2: 0 },
    actions: {
      open: {
        value: open(),
        get: open,
        set(v: boolean) {
          setOpen(v)
          ctx.setActive(v ? (props.id as any) : undefined)
        },
      },
    },
  }

  ctx.register({
    get id() {
      return props.id
    },
    get node() {
      return node
    },
    anchor: {
      get ref() {
        return triggerRef
      },
      get position() {
        return props.anchor?.position
      },
      get side() {
        return props.side
      },
      get align() {
        return props.align
      },
      component(p) {
        return (
          <PopoverPrimitive.Trigger
            {...p}
            data-slot="popover-trigger"
            render="div"
            class={cn(`
              absolute top-0 left-0 game-transform
              [--tx:calc(var(--scene-tx)+var(--node-anchor-x)*var(--wux))]
              [--ty:calc(var(--node-anchor-y)*var(--wuy))]
            `)}
            ref={(el) => {
              triggerRef = el
              el.style.setProperty('--node-anchor-x', `${props.anchor?.position.x}`)
              el.style.setProperty('--node-anchor-y', `${props.anchor?.position.y}`)
            }}
          />
        )
      },
    },
    content: {
      get ref() {
        return contentRef
      },
      component() {
        return <SceneryPopoverNodeContext.Provider value={node}>{props.children}</SceneryPopoverNodeContext.Provider>
      },
    },
    marker: {
      get ref() {
        return markerRef
      },
      get position() {
        return props.marker.position
      },
      component() {
        return (
          <SceneryPopoverNodeContext.Provider value={node}>
            <EventMarker ref={(el) => (markerRef = el)} {...props.marker} />
          </SceneryPopoverNodeContext.Provider>
        )
      },
    },
    asset: {
      get ref() {
        return assetRef
      },
      component() {
        return <Dynamic component={props.asset} nodeId={props.id} />
      },
    },
  })

  return null
}
