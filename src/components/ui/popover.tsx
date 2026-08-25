import { cn, defaultProps } from '@/lib/utils'
import { Popover as PopoverPrimitive } from '@msviderok/base-ui-solid/popover'
import { cva, type VariantProps } from 'class-variance-authority'
import {
  createContext,
  createRenderEffect,
  createSignal,
  onCleanup,
  onMount,
  Show,
  splitProps,
  useContext,
  type ComponentProps,
  type ParentProps,
} from 'solid-js'
import { useGlobalState } from '../GlobalStateContext'
import { Button, type VariantGameAction } from './button'

const popoverVariants = cva(
  'group z-50 w-72 rounded-base border-2 border-border bg-ph-mustard-yellow p-4  outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 transition-all [--arrow-offset:2px]',
  {
    variants: {
      variant: {
        default: 'bg-ph-mustard-yellow',
        scenery:
          'bg-white text-black [--arrow-offset:0px]! scale-[calc(100%*var(--is-open))] opacity-[calc(100%*var(--is-open))] duration-200 delay-100 ease-out border-4',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

type InferredPopoverVariantProps = VariantProps<typeof popoverVariants>

interface VariantOther {
  variant: Exclude<InferredPopoverVariantProps['variant'], 'scenery'>
  sceneryProps?: never
}

interface VariantScenery {
  variant: Extract<InferredPopoverVariantProps['variant'], 'scenery'>
  sceneryProps: {
    position: { x: number; y: number }
    hitbox: { x1: number; y1: number; x2: number; y2: number }
  }
}

type PopoverExtraProps = VariantOther | VariantScenery

type PopoverContextState = (VariantOther & { node?: never }) | (VariantScenery & { node: SceneNodePopover })
const PopoverContext = createContext<PopoverContextState>({ variant: 'default' })

export function usePopoverContext() {
  return useContext(PopoverContext)
}

function Popover(componentProps: PopoverPrimitive.Root.Props & PopoverExtraProps) {
  let ref!: HTMLDivElement
  let node: SceneNodePopover | undefined
  const { nodes } = useGlobalState()
  const props = defaultProps(componentProps, { variant: 'default' })
  const [local, misc, rest] = splitProps(props, ['variant', 'sceneryProps'], ['open'])

  createRenderEffect(() => {
    if (local.variant === 'scenery') {
      const [open, setOpen] = createSignal(false)
      node = {
        get rootRef() {
          return ref
        },
        type: 'popover',
        popupRef: undefined,
        position: local.sceneryProps.position,
        hitbox: {
          inWorldUnits: local.sceneryProps.hitbox,
          inPX: { x1: 0, y1: 0, x2: 0, y2: 0 },
        },
        actions: {
          open: {
            value: false,
            get: open,
            set: setOpen,
          },
        },
      }

      nodes.add(node)
    }
  })

  onMount(() => {
    if (local.variant === 'scenery') {
      ref.style.setProperty('--node-hitbox-x1', `${local.sceneryProps.hitbox.x1}`)
      ref.style.setProperty('--node-hitbox-x2', `${local.sceneryProps.hitbox.x2}`)
      ref.style.setProperty('--node-hitbox-y1', `${local.sceneryProps.hitbox.y1}`)
      ref.style.setProperty('--node-hitbox-y2', `${local.sceneryProps.hitbox.y2}`)
      onCleanup(() => node && nodes.delete(node))
    }
  })

  return (
    <PopoverContext.Provider
      value={
        {
          variant: local.variant,
          sceneryProps: local.sceneryProps,
          get node() {
            return node
          },
        } as PopoverContextState
      }
    >
      <Show when={props.variant === 'scenery'}>
        <div ref={(el) => (ref = el)} class="scene-node-popover-hitbox hitbox" />
      </Show>
      <PopoverPrimitive.Root data-slot="popover" open={props.variant === 'scenery' ? true : misc.open} {...rest} />
    </PopoverContext.Provider>
  )
}

function PopoverTrigger(props: PopoverPrimitive.Trigger.Props) {
  let ref!: HTMLElement
  const ctx = useContext(PopoverContext)
  const [local, rest] = splitProps(props, ['render', 'class', 'ref'])

  onMount(() => {
    if (ctx.variant === 'scenery') {
      ref.style.setProperty('--node-anchor-x', `${ctx.sceneryProps.position.x}`)
      ref.style.setProperty('--node-anchor-y', `${ctx.sceneryProps.position.y}`)
    }
  })

  return (
    <PopoverPrimitive.Trigger
      data-slot="popover-trigger"
      render={ctx.variant === 'scenery' ? { component: 'div' } : local.render}
      ref={(el) => {
        // oxlint-disable-next-line no-unused-expressions
        typeof local.ref === 'function' ? local.ref(el) : (local.ref = el)
        ref = el
      }}
      class={cn(local.class, ctx.variant === 'scenery' && 'scene-node-popover-trigger')}
      {...rest}
    />
  )
}

function PopoverPopup(props: PopoverPrimitive.Popup.Props) {
  const ctx = useContext(PopoverContext)
  const [local, rest] = splitProps(props, ['class', 'ref', 'style'])
  return (
    <PopoverPrimitive.Popup
      data-slot="popover-content"
      data-variant={ctx.variant}
      class={popoverVariants({ class: local.class, variant: ctx.variant })}
      ref={(el) => {
        if (ctx.variant === 'scenery') {
          ctx.node.popupRef = el
        }

        if (typeof local.ref === 'function') {
          local.ref(el)
        } else {
          local.ref = el
        }
      }}
      {...rest}
    />
  )
}

function PopoverArrow(props: ComponentProps<'div'>) {
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
          class="group-data-[variant=scenery]:fill-ph-mustard-yellow fill-ph-mustard-yellow"
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

function PopoverPortal(props: PopoverPrimitive.Portal.Props) {
  const ctx = useContext(PopoverContext)
  const { scene } = useGlobalState()
  return (
    <PopoverPrimitive.Portal
      keepMounted={ctx.variant === 'scenery'}
      container={ctx.variant === 'scenery' ? scene.ref : undefined}
      {...props}
    />
  )
}

function PopoverPositioner(props: PopoverPrimitive.Positioner.Props) {
  const ctx = useContext(PopoverContext)
  const [local, rest] = splitProps(props, ['class'])

  onMount(() => {
    if (ctx.variant !== 'scenery') return

    let transformOrigin: string = 'center center'

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
      class={cn('isolate z-50', local.class)}
      arrowPadding={15}
      align={ctx.variant === 'scenery' ? 'end' : 'start'}
      alignOffset={ctx.variant === 'scenery' ? 0 : 10}
      side={ctx.variant === 'scenery' ? 'top' : 'bottom'}
      sideOffset={ctx.variant === 'scenery' ? 0 : 10}
      trackAnchor={ctx.variant === 'scenery' ? false : undefined}
      collisionAvoidance={
        ctx.variant === 'scenery' ? { align: 'none', side: 'none', fallbackAxisSide: 'none' } : undefined
      }
      {...rest}
    />
  )
}

function PopoverHeader(props: ComponentProps<'div'>) {
  const [local, rest] = splitProps(props, ['class'])
  return <div data-slot="popover-header" class={cn('flex flex-col gap-1 text-base', local.class)} {...rest} />
}

function PopoverFooter(props: ComponentProps<'div'>) {
  const [local, rest] = splitProps(props, ['class'])
  return (
    <div
      data-slot="popover-footer"
      class={cn('flex items-center justify-between gap-1 text-base mt-3', local.class)}
      {...rest}
    />
  )
}

function PopoverAction(props: ComponentProps<'div'>) {
  const [local, rest] = splitProps(props, ['class'])
  return <div data-slot="popover-action" class={cn('text-base', local.class)} {...rest} />
}

function PopoverTitle(props: PopoverPrimitive.Title.Props) {
  const [local, rest] = splitProps(props, ['class'])
  return <PopoverPrimitive.Title data-slot="popover-title" class={cn('text-lg font-medium', local.class)} {...rest} />
}

function PopoverDescription(props: PopoverPrimitive.Description.Props) {
  const [local, rest] = splitProps(props, ['class'])
  return <PopoverPrimitive.Description data-slot="popover-description" class={cn('', local.class)} {...rest} />
}

function PopoverActionDoor(props: ParentProps<Pick<VariantGameAction, 'hotkey' | 'onHotkeyPress'>>) {
  return (
    <PopoverAction class="flex items-center gap-2 text-shade-ph-warm-pink/40">
      <Button
        variant="game-action"
        animate="scale"
        size="icon"
        hotkey={props.hotkey}
        onHotkeyPress={props.onHotkeyPress}
      >
        {props.hotkey}
      </Button>
      <span>{props.children}</span>
    </PopoverAction>
  )
}

export {
  Popover,
  PopoverAction,
  PopoverActionDoor,
  PopoverArrow,
  PopoverDescription,
  PopoverFooter,
  PopoverHeader,
  PopoverPopup,
  PopoverPortal,
  PopoverPositioner,
  PopoverTitle,
  PopoverTrigger,
}
