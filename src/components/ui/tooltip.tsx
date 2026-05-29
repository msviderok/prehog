import { ClientOnly } from '@tanstack/solid-router'
import { Tooltip as TooltipPrimitive } from '@msviderok/base-ui-solid/tooltip'
import { mergeProps, splitProps } from 'solid-js'
import { cn } from '@/lib/utils'

function TooltipProvider(props: TooltipPrimitive.Provider.Props) {
  const mergedProps = mergeProps({ delay: 0 }, props)
  const [local, rest] = splitProps(mergedProps, ['delay'])
  return (
    <ClientOnly>
      <TooltipPrimitive.Provider data-slot="tooltip-provider" delay={local.delay} {...rest} />
    </ClientOnly>
  )
}

function Tooltip(props: TooltipPrimitive.Root.Props) {
  return (
    <ClientOnly>
      <TooltipPrimitive.Root data-slot="tooltip" {...props} />
    </ClientOnly>
  )
}

function TooltipTrigger(props: TooltipPrimitive.Trigger.Props) {
  return (
    <ClientOnly>
      <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />
    </ClientOnly>
  )
}

function TooltipContent(
  props: TooltipPrimitive.Popup.Props &
    Pick<TooltipPrimitive.Positioner.Props, 'align' | 'alignOffset' | 'side' | 'sideOffset'>,
) {
  const mergedProps = mergeProps(
    {
      side: 'top' as const,
      sideOffset: 4,
      align: 'center' as const,
      alignOffset: 0,
    },
    props,
  )
  const [local, rest] = splitProps(mergedProps, ['class', 'side', 'sideOffset', 'align', 'alignOffset', 'children'])
  return (
    <ClientOnly>
      <TooltipPrimitive.Portal>
        <TooltipPrimitive.Positioner
          align={local.align}
          alignOffset={local.alignOffset}
          side={local.side}
          sideOffset={local.sideOffset}
          class="isolate z-50"
        >
          <TooltipPrimitive.Popup
            data-slot="tooltip-content"
            class={cn(
              'z-50 inline-flex w-fit max-w-xs origin-(--transform-origin) items-center gap-1.5 rounded-md bg-foreground px-3 py-1.5 text-xs text-background has-data-[slot=kbd]:pr-1.5 data-[side=bottom]:slide-in-from-top-2 data-[side=inline-end]:slide-in-from-left-2 data-[side=inline-start]:slide-in-from-right-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 **:data-[slot=kbd]:relative **:data-[slot=kbd]:isolate **:data-[slot=kbd]:z-50 **:data-[slot=kbd]:rounded-sm data-[state=delayed-open]:animate-in data-[state=delayed-open]:fade-in-0 data-[state=delayed-open]:zoom-in-95 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95',
              local.class,
            )}
            {...rest}
          >
            {local.children}
            <TooltipPrimitive.Arrow class="z-50 size-2.5 translate-y-[calc(-50%-2px)] rotate-45 rounded-[2px] bg-foreground fill-foreground data-[side=bottom]:top-1 data-[side=inline-end]:top-1/2! data-[side=inline-end]:-left-1 data-[side=inline-end]:-translate-y-1/2 data-[side=inline-start]:top-1/2! data-[side=inline-start]:-right-1 data-[side=inline-start]:-translate-y-1/2 data-[side=left]:top-1/2! data-[side=left]:-right-1 data-[side=left]:-translate-y-1/2 data-[side=right]:top-1/2! data-[side=right]:-left-1 data-[side=right]:-translate-y-1/2 data-[side=top]:-bottom-2.5" />
          </TooltipPrimitive.Popup>
        </TooltipPrimitive.Positioner>
      </TooltipPrimitive.Portal>
    </ClientOnly>
  )
}

export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger }
