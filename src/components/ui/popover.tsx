import { cn } from '@/lib/utils'
import { Popover as PopoverPrimitive } from '@msviderok/base-ui-solid/popover'
import { ClientOnly } from '@tanstack/solid-router'
import { mergeProps, splitProps, type ComponentProps } from 'solid-js'
import { cva, type VariantProps } from 'class-variance-authority'

const popoverVariants = cva(
  'z-50 w-72 rounded-base border-2 border-border p-4 outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 transition-all',
  {
    variants: {
      variant: {
        default: 'bg-yellow-200 text-yellow-800',
        scenery: 'bg-yellow-500 text-yellow-800 pointer-events-none',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

function Popover(props: PopoverPrimitive.Root.Props) {
  return (
    <ClientOnly>
      <PopoverPrimitive.Root data-slot="popover" {...props} />
    </ClientOnly>
  )
}

function PopoverTrigger(props: PopoverPrimitive.Trigger.Props) {
  return (
    <ClientOnly>
      <PopoverPrimitive.Trigger data-slot="popover-trigger" {...props} />
    </ClientOnly>
  )
}

export type PopoverContentPositionerProps = Pick<
  PopoverPrimitive.Positioner.Props,
  | 'collisionAvoidance'
  | 'align'
  | 'alignOffset'
  | 'side'
  | 'sideOffset'
  | 'arrowPadding'
  | 'anchor'
  | 'collisionBoundary'
  | 'collisionPadding'
  | 'sticky'
  | 'positionMethod'
  | 'trackAnchor'
>

export type PopoverContentProps = PopoverPrimitive.Popup.Props &
  PopoverContentPositionerProps &
  VariantProps<typeof popoverVariants> & {
    portalContainerRef?: HTMLElement
  }

function PopoverContent(props: PopoverContentProps) {
  const mergedProps = mergeProps(
    {
      variant: 'default' as const,
      arrowPadding: 15,
      get align(): PopoverContentPositionerProps['align'] {
        return props.variant === 'scenery' ? 'end' : 'start'
      },
      get alignOffset(): PopoverContentPositionerProps['alignOffset'] {
        return props.variant === 'scenery' ? 0 : 10
      },
      get side(): PopoverContentPositionerProps['side'] {
        return props.variant === 'scenery' ? 'top' : 'bottom'
      },
      get sideOffset(): PopoverContentPositionerProps['sideOffset'] {
        return props.variant === 'scenery' ? 0 : 10
      },
      get trackAnchor(): PopoverContentPositionerProps['trackAnchor'] {
        return props.variant === 'scenery' ? false : undefined
      },
      get collisionAvoidance(): PopoverContentPositionerProps['collisionAvoidance'] {
        return props.variant === 'scenery' ? { align: 'none', side: 'none', fallbackAxisSide: 'none' } : undefined
      },
    },
    props,
  )
  const [portal, positioner, popup, misc, rest] = splitProps(
    mergedProps,
    ['portalContainerRef'],
    [
      'collisionAvoidance',
      'align',
      'alignOffset',
      'side',
      'sideOffset',
      'arrowPadding',
      'anchor',
      'collisionBoundary',
      'collisionPadding',
      'sticky',
      'positionMethod',
      'trackAnchor',
    ],
    ['class', 'style'],
    ['variant'],
  )

  return (
    <ClientOnly>
      <PopoverPrimitive.Portal container={portal.portalContainerRef}>
        <PopoverPrimitive.Positioner {...positioner} class="isolate z-50">
          <PopoverPrimitive.Popup
            data-slot="popover-content"
            data-variant={misc.variant}
            style={{
              ...(typeof popup.style === 'object' ? popup.style : {}),
              '--arrow-offset': misc.variant === 'default' ? '2px' : '0px',
            }}
            class={cn(
              'group z-50 w-72 rounded-base border-2 border-border bg-card p-4 text-card-foreground outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 transition-all',
              popup.class,
            )}
            {...rest}
          />
        </PopoverPrimitive.Positioner>
      </PopoverPrimitive.Portal>
    </ClientOnly>
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
      <ArrowSvg />
    </PopoverPrimitive.Arrow>
  )
}

function PopoverHeader(props: ComponentProps<'div'>) {
  const [local, rest] = splitProps(props, ['class'])
  return (
    <ClientOnly>
      <div data-slot="popover-header" class={cn('flex flex-col gap-1 text-xs', local.class)} {...rest} />
    </ClientOnly>
  )
}

function PopoverTitle(props: PopoverPrimitive.Title.Props) {
  const [local, rest] = splitProps(props, ['class'])
  return (
    <ClientOnly>
      <PopoverPrimitive.Title data-slot="popover-title" class={cn('text-sm font-medium', local.class)} {...rest} />
    </ClientOnly>
  )
}

function PopoverDescription(props: PopoverPrimitive.Description.Props) {
  const [local, rest] = splitProps(props, ['class'])
  return (
    <ClientOnly>
      <PopoverPrimitive.Description
        data-slot="popover-description"
        class={cn('text-muted-foreground', local.class)}
        {...rest}
      />
    </ClientOnly>
  )
}

function ArrowSvg(props: ComponentProps<'svg'>) {
  return (
    <svg width="20" height="10" viewBox="0 0 20 10" fill="none" {...props}>
      {' '}
      <path
        d="M9.66437 2.60207L4.80758 6.97318C4.07308 7.63423 3.11989 8 2.13172 8H0V10H20V8H18.5349C17.5468 8 16.5936 7.63423 15.8591 6.97318L11.0023 2.60207C10.622 2.2598 10.0447 2.25979 9.66437 2.60207Z"
        class="group-data-[variant=scenery]:fill-yellow-500 fill-yellow-200"
      />{' '}
      <path
        d="M8.99542 1.85876C9.75604 1.17425 10.9106 1.17422 11.6713 1.85878L16.5281 6.22989C17.0789 6.72568 17.7938 7.00001 18.5349 7.00001L15.89 7L11.0023 2.60207C10.622 2.2598 10.0447 2.2598 9.66436 2.60207L4.77734 7L2.13171 7.00001C2.87284 7.00001 3.58774 6.72568 4.13861 6.22989L8.99542 1.85876Z"
        class="fill-border"
      />{' '}
      <path
        d="M10.3333 3.34539L5.47654 7.71648C4.55842 8.54279 3.36693 9 2.13172 9H0V8H2.13172C3.11989 8 4.07308 7.63423 4.80758 6.97318L9.66437 2.60207C10.0447 2.25979 10.622 2.2598 11.0023 2.60207L15.8591 6.97318C16.5936 7.63423 17.5468 8 18.5349 8H20V9H18.5349C17.2998 9 16.1083 8.54278 15.1901 7.71648L10.3333 3.34539Z"
        class="fill-border"
      />{' '}
    </svg>
  )
}

export { Popover, PopoverContent, PopoverDescription, PopoverHeader, PopoverTitle, PopoverTrigger, PopoverArrow }
