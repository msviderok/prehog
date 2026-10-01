import { Popover as PopoverPrimitive } from '@msviderok/base-ui-solid/popover'
import { cn } from 'cn'
import { splitProps, type ComponentProps } from 'solid-js'
import { PopoverArrowIcon } from '../PopoverArrow'

export function Popover(props: PopoverPrimitive.Root.Props) {
  return <PopoverPrimitive.Root data-slot="popover" {...props} />
}

export function PopoverTrigger(props: PopoverPrimitive.Trigger.Props) {
  return <PopoverPrimitive.Trigger data-slot="popover-trigger" {...props} />
}

export function PopoverContent(props: PopoverPrimitive.Popup.Props) {
  const [local, rest] = splitProps(props, ['class', 'children'])

  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Positioner
        class="isolate z-50"
        align="start"
        side="bottom"
        arrowPadding={15}
        alignOffset={10}
        sideOffset={10}
      >
        <PopoverPrimitive.Popup
          data-slot="popover-content"
          class={cn(
            'group z-50 rounded-base origin-(--transform-origin) p-4 outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 transition-all [--arrow-offset:2px]',
            local.class,
          )}
          {...rest}
        />
      </PopoverPrimitive.Positioner>
    </PopoverPrimitive.Portal>
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

export function PopoverArrow(props: ComponentProps<'div'>) {
  return (
    <PopoverPrimitive.Arrow
      data-slot="popover-arrow"
      {...props}
      class={cn(
        `data-[side=bottom]:top-[calc(-9px+var(--arrow-offset))]
        data-[side=left]:right-[calc(-14px+var(--arrow-offset))]
        data-[side=left]:rotate-90
        data-[side=right]:left-[calc(-14px+var(--arrow-offset))]
        data-[side=right]:-rotate-90
        data-[side=top]:bottom-[calc(-9px+var(--arrow-offset))]
        data-[side=top]:rotate-180`,
        props.class,
      )}
    >
      <PopoverArrowIcon
        class={cn(`
          *:nth-[0]:fill-glass-ph-very-dark-cornflower-blue/5
          *:nth-[1]:fill-(--bc)
          *:nth-[2]:fill-(--bc)
        `)}
      />
    </PopoverPrimitive.Arrow>
  )
}

export function PopoverAction(props: ComponentProps<'div'>) {
  const [local, rest] = splitProps(props, ['class'])
  return <div data-slot="popover-action" class={cn('text-base', local.class)} {...rest} />
}

export function PopoverTitle(props: PopoverPrimitive.Title.Props) {
  const [local, rest] = splitProps(props, ['class'])
  return <PopoverPrimitive.Title data-slot="popover-title" class={cn('text-3xl font-medium', local.class)} {...rest} />
}

export function PopoverDescription(props: PopoverPrimitive.Description.Props) {
  const [local, rest] = splitProps(props, ['class'])
  return <PopoverPrimitive.Description data-slot="popover-description" class={cn('', local.class)} {...rest} />
}
