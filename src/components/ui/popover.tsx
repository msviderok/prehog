import { cn } from '@/lib/utils'
import { Popover as PopoverPrimitive } from '@msviderok/base-ui-solid/popover'
import { ClientOnly } from '@tanstack/solid-router'
import { mergeProps, splitProps, type ComponentProps } from 'solid-js'

function Popover(props: PopoverPrimitive.Root.Props) {
  return <PopoverPrimitive.Root data-slot="popover" {...props} />
}

function PopoverTrigger(props: PopoverPrimitive.Trigger.Props) {
  return <PopoverPrimitive.Trigger data-slot="popover-trigger" {...props} />
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
function PopoverContent(
  props: PopoverPrimitive.Popup.Props &
    PopoverContentPositionerProps & {
      portalContainerRef?: HTMLElement
    },
) {
  const mergedProps = mergeProps(
    {
      align: 'end' as const,
      alignOffset: 0,
      side: 'top' as const,
      sideOffset: 0,
      arrowPadding: 15,
      trackAnchor: false,
      collisionAvoidance: {
        align: 'none',
        side: 'none',
        fallbackAxisSide: 'none',
      },
    } satisfies PopoverPrimitive.Positioner.Props,
    props,
  )
  const [portal, positioner, popup, rest] = splitProps(
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
    ['class', 'children'],
  )

  return (
    <PopoverPrimitive.Portal container={portal.portalContainerRef} keepMounted>
      {/* <PopoverPrimitive.Backdrop class="fixed inset-0 min-h-dvh bg-black opacity-10 transition-all duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0 dark:opacity-70 supports-[-webkit-touch-callout:none]:absolute" /> */}
      <PopoverPrimitive.Positioner {...positioner} class="isolate z-50">
        <PopoverPrimitive.Popup
          data-slot="popover-content"
          class={cn(
            'z-50 w-72 rounded-base border-2 border-border bg-main p-4 text-foreground outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 transition-all',
            popup.class,
          )}
          {...rest}
        >
          <PopoverPrimitive.Arrow class="data-[side=bottom]:top-[-9px] data-[side=left]:right-[-14px] data-[side=left]:rotate-90 data-[side=right]:left-[-14px] data-[side=right]:-rotate-90 data-[side=top]:bottom-[-9px] data-[side=top]:rotate-180">
            <ArrowSvg />
          </PopoverPrimitive.Arrow>
          {popup.children}
        </PopoverPrimitive.Popup>
      </PopoverPrimitive.Positioner>
    </PopoverPrimitive.Portal>
  )
}

function PopoverHeader(props: ComponentProps<'div'>) {
  const [local, rest] = splitProps(props, ['class'])
  return <div data-slot="popover-header" class={cn('flex flex-col gap-1 text-xs', local.class)} {...rest} />
}

function PopoverTitle(props: PopoverPrimitive.Title.Props) {
  const [local, rest] = splitProps(props, ['class'])
  return <PopoverPrimitive.Title data-slot="popover-title" class={cn('text-sm font-medium', local.class)} {...rest} />
}

function PopoverDescription(props: PopoverPrimitive.Description.Props) {
  const [local, rest] = splitProps(props, ['class'])
  return (
    <PopoverPrimitive.Description
      data-slot="popover-description"
      class={cn('text-muted-foreground', local.class)}
      {...rest}
    />
  )
}

function ArrowSvg(props: ComponentProps<'svg'>) {
  return (
    <svg width="20" height="10" viewBox="0 0 20 10" fill="none" {...props}>
      {' '}
      <path
        d="M9.66437 2.60207L4.80758 6.97318C4.07308 7.63423 3.11989 8 2.13172 8H0V10H20V8H18.5349C17.5468 8 16.5936 7.63423 15.8591 6.97318L11.0023 2.60207C10.622 2.2598 10.0447 2.25979 9.66437 2.60207Z"
        class="fill-main"
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

function ClientOnlyPopover(props: Parameters<typeof Popover>[0]) {
  return (
    <ClientOnly>
      <Popover {...props} />
    </ClientOnly>
  )
}
function ClientOnlyPopoverContent(props: Parameters<typeof PopoverContent>[0]) {
  return (
    <ClientOnly>
      <PopoverContent {...props} />
    </ClientOnly>
  )
}
function ClientOnlyPopoverDescription(props: Parameters<typeof PopoverDescription>[0]) {
  return (
    <ClientOnly>
      <PopoverDescription {...props} />
    </ClientOnly>
  )
}
function ClientOnlyPopoverHeader(props: Parameters<typeof PopoverHeader>[0]) {
  return (
    <ClientOnly>
      <PopoverHeader {...props} />
    </ClientOnly>
  )
}
function ClientOnlyPopoverTitle(props: Parameters<typeof PopoverTitle>[0]) {
  return (
    <ClientOnly>
      <PopoverTitle {...props} />
    </ClientOnly>
  )
}
function ClientOnlyPopoverTrigger(props: Parameters<typeof PopoverTrigger>[0]) {
  return (
    <ClientOnly>
      <PopoverTrigger {...props} />
    </ClientOnly>
  )
}

export {
  ClientOnlyPopover as Popover,
  ClientOnlyPopoverContent as PopoverContent,
  ClientOnlyPopoverDescription as PopoverDescription,
  ClientOnlyPopoverHeader as PopoverHeader,
  ClientOnlyPopoverTitle as PopoverTitle,
  ClientOnlyPopoverTrigger as PopoverTrigger,
}
