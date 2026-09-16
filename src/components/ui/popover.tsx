import { api } from '@/convex/api'
import { defaultProps } from '@/lib/utils'
import { Popover as PopoverPrimitive } from '@msviderok/base-ui-solid/popover'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from 'cn'
import { useMutation } from 'convex-solidjs'
import {
  createContext,
  createEffect,
  createMemo,
  createRenderEffect,
  createSignal,
  on,
  onCleanup,
  onMount,
  Show,
  splitProps,
  useContext,
  type ComponentProps,
  type JSX,
  type ParentProps,
} from 'solid-js'
import { EventMarker } from '../../routes/_authed/-components/EventMarker'
import { useGlobalState } from '../../routes/_authed/-components/GlobalStateContext'
import { PressE } from './button'
import { useSceneryPopoverNode } from '@/routes/_authed/-components/SceneryPopover'
import { useRouter } from '@tanstack/solid-router'

const DEBUG = false

export const popoverVariants = cva(
  'group z-50 w-72 rounded-base border-2 border-border p-4 outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 transition-all [--arrow-offset:2px]',
  {
    variants: {
      variant: {
        default: 'bg-ph-mustard-yellow',
        scenery:
          'bg-glass-ph-mustard-yellow text-black [--arrow-offset:0px]! data-starting-style:opacity-0 data-ending-style:opacity-0 data-closed:opacity-0 duration-200 ease-out border-4',
      },
      flavour: {
        default: '',
        'action-only': 'bg-transparent! border-none',
      },
    },
    defaultVariants: {
      variant: 'default',
      flavour: 'default',
    },
    compoundVariants: [
      {
        variant: 'scenery',
        flavour: 'action-only',
        class: 'w-auto',
      },
    ],
  },
)

type InferredPopoverVariantProps = VariantProps<typeof popoverVariants>
type BaseInferredProps = Omit<InferredPopoverVariantProps, 'variant'>

interface VariantOther extends BaseInferredProps {
  variant: Exclude<InferredPopoverVariantProps['variant'], 'scenery'>
  sceneryProps?: never
}

interface VariantScenery extends BaseInferredProps {
  variant: Extract<InferredPopoverVariantProps['variant'], 'scenery'>
  sceneryProps: {
    anchorPosition: { x: number; y: number }
    hitboxPosition: { x: number; y: number }
    onNodeRegistered?: (node: SceneNodePopover) => void
  }
}

type PopoverExtraProps = VariantOther | VariantScenery

type PopoverContextState = (VariantOther & { node?: never }) | (VariantScenery & { node: SceneNodePopover })
const PopoverContext = createContext<PopoverContextState>({ variant: 'default', flavour: 'default' })

export function usePopoverContext() {
  return useContext(PopoverContext)
}

export function createHandle() {
  const [currentTrigger, setCurrentTrigger] = createSignal<HTMLElement>()
  const data = new Map<HTMLElement, { trigger: JSX.Element; content: JSX.Element }>()
  const active = createMemo(() => (currentTrigger() ? data.get(currentTrigger()!) : undefined))

  return {
    active,
    register(trigger: HTMLElement, content: HTMLElement) {
      data.set(trigger, { trigger, content })
    },
    setActive(trigger: HTMLElement) {
      setCurrentTrigger(trigger)
    },
  }
}

export function Popover(componentProps: PopoverPrimitive.Root.Props & PopoverExtraProps) {
  let ref!: HTMLDivElement
  let node: SceneNodePopover | undefined
  const { nodes } = useGlobalState()
  const props = defaultProps(componentProps, { variant: 'default', flavour: 'default' })
  const [local, misc, rest] = splitProps(props, ['variant', 'sceneryProps', 'flavour'], ['open'])

  createRenderEffect(() => {
    if (local.variant === 'scenery') {
      const [open, setOpen] = createSignal(DEBUG ? true : false)
      node = {
        get rootRef() {
          return ref
        },
        type: 'popover',
        popupRef: undefined,
        position: local.sceneryProps.anchorPosition,
        size: {
          inWorldUnits: { width: 0, height: 0 },
          inPX: { width: 0, height: 0 },
        },
        hitbox: {
          position: local.sceneryProps.hitboxPosition,
          inWorldUnits: { x1: 0, y1: 0, x2: 0, y2: 0 },
          inPX: { x1: 0, y1: 0, x2: 0, y2: 0 },
        },
        actions: {
          open: {
            value: DEBUG ? true : false,
            get: open,
            set: setOpen,
          },
        },
      }

      nodes.add(node)
      local.sceneryProps.onNodeRegistered?.(node)
    }
  })

  onCleanup(() => node && nodes.delete(node))

  return (
    <PopoverContext.Provider
      value={
        {
          variant: local.variant,
          flavour: local.flavour,
          sceneryProps: local.sceneryProps,
          get node() {
            return node
          },
        } as PopoverContextState
      }
    >
      <Show when={props.variant === 'scenery'}>
        <EventMarker ref={(el) => (ref = el)} />
      </Show>
      <PopoverPrimitive.Root data-slot="popover" open={props.variant === 'scenery' ? true : misc.open} {...rest} />
    </PopoverContext.Provider>
  )
}

export function PopoverTrigger(props: PopoverPrimitive.Trigger.Props) {
  let ref!: HTMLElement
  const ctx = useContext(PopoverContext)
  const [local, rest] = splitProps(props, ['render', 'class', 'ref'])

  onMount(() => {
    if (ctx.variant === 'scenery') {
      ref.style.setProperty('--node-anchor-x', `${ctx.sceneryProps.anchorPosition.x}`)
      ref.style.setProperty('--node-anchor-y', `${ctx.sceneryProps.anchorPosition.y}`)
    }
  })

  return (
    <PopoverPrimitive.Trigger
      data-slot="popover-trigger"
      render={ctx.variant === 'scenery' ? { component: 'div' } : local.render}
      class={cn(
        local.class,
        ctx.variant === 'scenery' &&
          `absolute top-0 left-0 game-transform
          [--tx:calc(var(--scene-tx)+var(--node-anchor-x)*var(--scene-world-unit-x))]
          [--ty:calc(var(--node-anchor-y)*var(--scene-world-unit-y))]
          `,
      )}
      ref={(el) => {
        ref = el
        typeof local.ref === 'function' ? local.ref(el) : (local.ref = el)
      }}
      {...rest}
    />
  )
}

export function PopoverPopup(props: PopoverPrimitive.Popup.Props) {
  const ctx = useContext(PopoverContext)
  const [local, rest] = splitProps(props, ['class', 'ref', 'style'])
  return (
    <PopoverPrimitive.Popup
      data-slot="popover-content"
      data-variant={ctx.variant}
      class={popoverVariants({ class: local.class, variant: ctx.variant, flavour: ctx.flavour })}
      ref={(el) => {
        if (ctx.variant === 'scenery') ctx.node.popupRef = el
        typeof local.ref === 'function' ? local.ref(el) : (local.ref = el)
      }}
      {...rest}
    />
  )
}

export function PopoverArrow(props: ComponentProps<'div'>) {
  return (
    <PopoverPrimitive.Arrow
      data-slot="popover-arrow"
      {...props}
      class={cn(
        'data-[side=bottom]:top-[calc(-9px+var(--arrow-offset))] data-[side=left]:right-[calc(-14px+var(--arrow-offset))] data-[side=left]:rotate-90 data-[side=right]:left-[calc(-14px+var(--arrow-offset))] data-[side=right]:-rotate-90 data-[side=top]:bottom-[calc(-9px+var(--arrow-offset))] data-[side=top]:rotate-180',
        props.class,
      )}
    >
      <svg width="20" height="10" viewBox="0 0 20 10" fill="none">
        <path
          d="M9.66437 2.60207L4.80758 6.97318C4.07308 7.63423 3.11989 8 2.13172 8H0V10H20V8H18.5349C17.5468 8 16.5936 7.63423 15.8591 6.97318L11.0023 2.60207C10.622 2.2598 10.0447 2.25979 9.66437 2.60207Z"
          class="group-data-[variant=scenery]:fill-white fill-white"
        />
        <path
          d="M8.99542 1.85876C9.75604 1.17425 10.9106 1.17422 11.6713 1.85878L16.5281 6.22989C17.0789 6.72568 17.7938 7.00001 18.5349 7.00001L15.89 7L11.0023 2.60207C10.622 2.2598 10.0447 2.2598 9.66436 2.60207L4.77734 7L2.13171 7.00001C2.87284 7.00001 3.58774 6.72568 4.13861 6.22989L8.99542 1.85876Z"
          class="fill-border"
        />
        <path
          d="M10.3333 3.34539L5.47654 7.71648C4.55842 8.54279 3.36693 9 2.13172 9H0V8H2.13172C3.11989 8 4.07308 7.63423 4.80758 6.97318L9.66437 2.60207C10.0447 2.25979 10.622 2.2598 11.0023 2.60207L15.8591 6.97318C16.5936 7.63423 17.5468 8 18.5349 8H20V9H18.5349C17.2998 9 16.1083 8.54278 15.1901 7.71648L10.3333 3.34539Z"
          class="fill-border"
        />
      </svg>
    </PopoverPrimitive.Arrow>
  )
}

export function PopoverPortal(props: PopoverPrimitive.Portal.Props) {
  const ctx = useContext(PopoverContext)
  const { scene } = useGlobalState()

  return (
    <PopoverPrimitive.Portal
      keepMounted={ctx.variant === 'scenery'}
      container={ctx.variant === 'scenery' ? scene.popupContainerRef : undefined}
      {...props}
    />
  )
}

export function PopoverPositioner(props: PopoverPrimitive.Positioner.Props) {
  const ctx = useContext(PopoverContext)
  const [local, rest] = splitProps(props, ['class'])

  onMount(() => {
    if (ctx.variant !== 'scenery') return

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

    if (ctx.node.popupRef) {
      ctx.node.popupRef.style.transformOrigin = transformOrigin
    }
  })

  return (
    <PopoverPrimitive.Positioner
      class={cn('isolate z-50 scale-(--scale)', local.class)}
      arrowPadding={15}
      align={ctx.variant === 'scenery' ? 'end' : 'start'}
      alignOffset={ctx.variant === 'scenery' ? 0 : 10}
      side={ctx.variant === 'scenery' ? 'top' : 'bottom'}
      sideOffset={ctx.variant === 'scenery' ? 0 : 10}
      trackAnchor={ctx.variant === 'scenery' ? true : undefined}
      collisionAvoidance={
        ctx.variant === 'scenery' ? { align: 'none', side: 'none', fallbackAxisSide: 'none' } : undefined
      }
      {...rest}
    />
  )
}

export function PopoverHeader(props: ComponentProps<'div'>) {
  const [local, rest] = splitProps(props, ['class'])
  return <div data-slot="popover-header" class={cn('flex flex-col gap-1 text-base', local.class)} {...rest} />
}

export function PopoverFooter(props: ComponentProps<'div'>) {
  const [local, rest] = splitProps(props, ['class'])
  return (
    <div
      data-slot="popover-footer"
      class={cn('flex items-center justify-between gap-1 text-base mt-3', local.class)}
      {...rest}
    />
  )
}

export function PopoverAction(props: ComponentProps<'div'>) {
  const [local, rest] = splitProps(props, ['class'])
  return <div data-slot="popover-action" class={cn('text-base', local.class)} {...rest} />
}

export function PopoverTitle(props: PopoverPrimitive.Title.Props) {
  const [local, rest] = splitProps(props, ['class'])
  return <PopoverPrimitive.Title data-slot="popover-title" class={cn('text-lg font-medium', local.class)} {...rest} />
}

export function PopoverDescription(props: PopoverPrimitive.Description.Props) {
  const [local, rest] = splitProps(props, ['class'])
  return <PopoverPrimitive.Description data-slot="popover-description" class={cn('', local.class)} {...rest} />
}

export function PopoverActionDoor(props: ParentProps<{ to: CurrentScene }>) {
  const router = useRouter()
  const node = useSceneryPopoverNode()
  const { player } = useGlobalState()
  const setScene = useMutation(api.gameState.setScene)

  createEffect(
    on(node.actions.open.get, (popoverOpen) => {
      if (popoverOpen) void router.preloadRoute({ to: `/${props.to}` })
    }),
  )

  return (
    <PopoverAction class="flex items-center gap-2 text-shade-ph-warm-pink/40">
      <PressE onPress={() => void setScene.mutate({ scene: props.to, x: player.x })} />
      <span class="comic-40">{props.children}</span>
    </PopoverAction>
  )
}

export function PopoverBackdrop(props: PopoverPrimitive.Backdrop.Props) {
  const ctx = useContext(PopoverContext)
  const [local, rest] = splitProps(props, ['class'])
  return (
    <PopoverPrimitive.Backdrop
      data-slot="popover-backdrop"
      class={cn(
        'fixed inset-0 scale-[calc(100/var(--scale)/100)] data-starting-style:opacity-0',
        ctx.variant === 'scenery' && ctx.node.actions.open.get() && 'bg-black/40',
        local.class,
      )}
      {...rest}
    />
  )
}
