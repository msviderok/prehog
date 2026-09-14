import { Popover as PopoverPrimitive } from '@msviderok/base-ui-solid/popover'
import { cn } from 'cn'
import {
  createContext,
  createEffect,
  createMemo,
  createSignal,
  For,
  mergeProps,
  onCleanup,
  onMount,
  splitProps,
  useContext,
  type Accessor,
  type Component,
  type JSX,
  type ParentProps,
} from 'solid-js'
import { createStore, produce, type SetStoreFunction, type Store } from 'solid-js/store'
import { Dynamic } from 'solid-js/web'
import { EventMarker } from './EventMarker'
import { useGlobalState } from './GlobalStateContext'
import { popoverVariants } from '@/components/ui/popover'
import { Motion, type MotionComponentProps, type MotionProxyComponent } from 'solid-motionone'

const ANIMATION_DURATION_MS = 200

interface PopoverItem<K extends string> {
  id: K
  node: SceneNodePopover
  anchor: { ref: HTMLElement; position: Coords; component: Component }
  marker: { ref: HTMLElement; position: Coords; component: Component }
  content: { ref: HTMLElement; component: Component }
}

interface ComponentsStore {
  anchors: Component[]
  markers: Component[]
  contents: Component[]
}

interface Active<K extends string> {
  current: PopoverItem<K> | undefined
  lastActive: PopoverItem<K> | undefined
}

interface SceneryPopoverState<K extends string> {
  registry: Map<K, PopoverItem<K>>
  anchorRef: Accessor<HTMLElement | undefined>
  active: Accessor<PopoverItem<K> | undefined>
  lastActive: Accessor<PopoverItem<K> | undefined>
  register(data: PopoverItem<K>): void
  setActive(id: K): void
  popupRef: HTMLElement
  portalRef: HTMLElement
  backdropRef: HTMLElement
  positionerRef: HTMLElement
  components: ComponentsStore
  setComponents: SetStoreFunction<ComponentsStore>
}

const SceneryPopoverContext = createContext<SceneryPopoverState<string>>()

export function useSceneryPopover() {
  const ctx = useContext(SceneryPopoverContext)
  if (!ctx) throw new Error('useSceneryPopoverContext must be used within a SceneryPopoverProvider')
  return ctx
}

export function SceneryPopoverProvider<K extends string>(props: ParentProps) {
  let popupRef!: HTMLElement
  let portalRef!: HTMLElement
  let backdropRef!: HTMLElement
  let positionerRef!: HTMLElement
  const { nodes } = useGlobalState()
  const [_active, _setActive] = createStore({ current: undefined as K | undefined, last: undefined as K | undefined })
  const [components, setComponents] = createStore<ComponentsStore>({ anchors: [], markers: [], contents: [] })

  const registry = new Map<K, PopoverItem<K>>()
  const active = createMemo(() => (_active.current ? registry.get(_active.current)! : undefined))
  const lastActive = createMemo(() => (_active.last ? registry.get(_active.last)! : undefined))

  function register(data: PopoverItem<K>) {
    registry.set(data.id, data)
    nodes.add(data.node)

    setComponents(
      produce((draft) => {
        draft.anchors.push(data.anchor.component)
        draft.markers.push(data.marker.component)
        draft.contents.push(data.content.component)
      }),
    )
    // data.onNodeRegistered?.(data.node)

    onCleanup(() => {
      nodes.delete(data.node)
      setComponents(
        produce((draft) => {
          draft.anchors = draft.anchors.filter((t) => t !== data.anchor.component)
          draft.markers = draft.markers.filter((m) => m !== data.marker.component)
          draft.contents = draft.contents.filter((c) => c !== data.content.component)
        }),
      )
    })
  }

  function setActive(id: K) {
    _setActive({ current: id, last: _active.current })
  }

  const anchorRef = createMemo(() => {
    if (_active.current) return registry.get(_active.current)!.anchor.ref
    if (_active.last) return registry.get(_active.last)!.anchor.ref
    return undefined
  })

  const context: SceneryPopoverState<K> = {
    registry,
    active,
    anchorRef,
    lastActive,
    register,
    setActive,
    components,
    setComponents,
    popupRef,
    portalRef,
    backdropRef,
    positionerRef,
  }

  const isOpen = createMemo(() => active()?.node.actions.open.get() ?? false)

  return (
    <SceneryPopoverContext.Provider value={context}>
      <PopoverPrimitive.Root open={isOpen()}>{props.children}</PopoverPrimitive.Root>
    </SceneryPopoverContext.Provider>
  )
}

export function SceneryPopoverPortal() {
  const ctx = useSceneryPopover()
  const { scene } = useGlobalState()

  return (
    <>
      <PopoverPrimitive.Backdrop
        data-slot="popover-backdrop"
        style={{ 'animation-duration': `${ANIMATION_DURATION_MS}ms` }}
        class="fixed inset-0 bg-black opacity-0 transition-opacity data-starting-style:opacity-0 data-closed:opacity-0 data-open:opacity-50 ease-in-out"
        ref={(el) => (ctx.backdropRef = el)}
      />

      <For each={ctx.components.anchors}>{(anchor) => <Dynamic component={anchor} />}</For>
      <For each={ctx.components.markers}>{(marker) => <Dynamic component={marker} />}</For>

      <PopoverPrimitive.Portal keepMounted container={scene.ref}>
        <div class="z-1 fixed inset-0 translate-y-(--scene-offset-top)">
          <div class="absolute top-0 left-0 translate-x-(--scene-tx) w-(--scene-width-scaled) h-(--scene-height-scaled)">
            <PopoverPrimitive.Positioner
              class="isolate z-50"
              arrowPadding={15}
              align={'end'}
              alignOffset={0}
              side="top"
              sideOffset={0}
              trackAnchor={true}
              anchor={ctx.anchorRef()}
              collisionAvoidance={{ align: 'none', side: 'none', fallbackAxisSide: 'none' }}
              ref={(el) => (ctx.positionerRef = el)}
            >
              <PopoverPrimitive.Popup
                data-slot="popover-content"
                data-variant="scenery"
                class={popoverVariants({ variant: 'scenery' })}
                ref={(el) => (ctx.popupRef = el)}
              >
                <Dynamic component={ctx.active()?.content.component ?? ctx.lastActive()?.content.component} />
              </PopoverPrimitive.Popup>
            </PopoverPrimitive.Positioner>
          </div>
        </div>
      </PopoverPrimitive.Portal>
    </>
  )
}

export function SceneryPopover<const K extends string>(
  props: {
    id: K
    markerPosition: Coords
    anchorPosition: Coords
    children: JSX.Element
    anchor?: PopoverPrimitive.Trigger.Props | undefined
  } & Pick<PopoverPrimitive.Positioner.Props, 'side' | 'align'>,
) {
  let triggerRef!: HTMLElement
  let contentRef!: HTMLElement
  let markerRef!: HTMLElement
  const ctx = useSceneryPopover()
  const [open, setOpen] = createSignal(true)

  onMount(() => {
    let transformOrigin = 'center center'

    switch (true) {
      case props.side === 'top' && props.align === 'start':
        transformOrigin = 'bottom left'
        break
      case props.side === 'left' && props.align === 'end':
        transformOrigin = 'bottom right'
        break
      case props.side === 'right' && props.align === 'center':
        transformOrigin = 'left'
        break
      case props.side === 'top' && props.align === 'end':
        transformOrigin = 'bottom right'
        break
      case props.side === 'left' && props.align === 'start':
        transformOrigin = 'top right'
        break
      case props.side === 'bottom' && props.align === 'end':
        transformOrigin = 'top right'
        break
    }

    ctx.popupRef.style.transformOrigin = transformOrigin
  })

  const node: SceneNodePopover = {
    type: 'popover',
    get rootRef() {
      return markerRef
    },
    get popupRef() {
      return ctx.popupRef
    },
    get position() {
      return props.anchorPosition
    },
    size: {
      inWorldUnits: { width: 0, height: 0 },
      inPX: { width: 0, height: 0 },
    },
    hitbox: {
      get position() {
        return props.markerPosition
      },
      inWorldUnits: { x1: 0, y1: 0, x2: 0, y2: 0 },
      inPX: { x1: 0, y1: 0, x2: 0, y2: 0 },
    },
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
        return props.anchorPosition
      },
      component(p) {
        const mergedProps = mergeProps(p, props.anchor)
        const [local, rest] = splitProps(mergedProps, ['class', 'ref'])
        return (
          <PopoverPrimitive.Trigger
            data-slot="popover-trigger"
            render="div"
            class={cn(
              `absolute top-0 left-0 game-transform
            [--tx:calc(var(--scene-tx)+var(--node-anchor-x)*var(--scene-world-unit-x))]
            [--ty:calc(var(--node-anchor-y)*var(--scene-world-unit-y))]
            `,
              local.class,
            )}
            ref={(el) => {
              triggerRef = el
              typeof local.ref === 'function' ? local.ref(el) : (local.ref = el)
              el.style.setProperty('--node-anchor-x', `${props.anchorPosition.x}`)
              el.style.setProperty('--node-anchor-y', `${props.anchorPosition.y}`)
            }}
            {...rest}
          />
        )
      },
    },
    content: {
      get ref() {
        return contentRef
      },
      component() {
        return <>{props.children}</>
      },
    },
    marker: {
      get ref() {
        return markerRef
      },
      get position() {
        return props.markerPosition
      },
      component() {
        return (
          <>
            <EventMarker ref={(el) => (markerRef = el)} />
          </>
        )
      },
    },
  })

  return null
}
