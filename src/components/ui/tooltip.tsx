import { cn, defaultProps } from '@/lib/utils'
import { Tooltip as TooltipPrimitive } from '@msviderok/base-ui-solid/tooltip'
import { createContext, mergeProps, splitProps, useContext } from 'solid-js'
import { cva, type VariantProps } from 'class-variance-authority'

const tooltipVariants = cva(
  'group z-50 inline-flex w-fit max-w-xs origin-(--transform-origin) items-center gap-1.5 px-3 py-1.5 outline-none text-xs has-data-[slot=kbd]:pr-1.5 data-[side=bottom]:slide-in-from-top-2 data-[side=inline-end]:slide-in-from-left-2 data-[side=inline-start]:slide-in-from-right-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 **:data-[slot=kbd]:relative **:data-[slot=kbd]:isolate **:data-[slot=kbd]:z-50 **:data-[slot=kbd]:rounded-sm data-[state=delayed-open]:animate-in data-[state=delayed-open]:fade-in-0 data-[state=delayed-open]:zoom-in-95 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95',
  {
    variants: {
      variant: {
        default: 'bg-ph-mustard-yellow rounded-base border-2 border-border text-border',
        action: 'bg-transparent',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

type InferredTooltipVariantProps = VariantProps<typeof tooltipVariants>
const TooltipContext = createContext<InferredTooltipVariantProps>({ variant: 'default' })

function TooltipProvider(props: TooltipPrimitive.Provider.Props) {
  const mergedProps = mergeProps({ delay: 0 }, props)
  const [local, rest] = splitProps(mergedProps, ['delay'])
  return <TooltipPrimitive.Provider data-slot="tooltip-provider" delay={local.delay} {...rest} />
}

function Tooltip(props: TooltipPrimitive.Root.Props & InferredTooltipVariantProps) {
  const [local, rest] = splitProps(props, ['variant'])
  return (
    <TooltipContext.Provider value={{ variant: local.variant }}>
      <TooltipPrimitive.Root data-slot="tooltip" {...rest} />
    </TooltipContext.Provider>
  )
}

function TooltipTrigger(props: TooltipPrimitive.Trigger.Props) {
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />
}

function TooltipPopup(props: TooltipPrimitive.Popup.Props) {
  const ctx = useContext(TooltipContext)
  const [local, rest] = splitProps(props, ['class'])
  return (
    <TooltipPrimitive.Popup
      data-slot="tooltip-content"
      class={tooltipVariants({ class: local.class, variant: ctx.variant })}
      {...rest}
    />
  )
}

function TooltipArrow(props: TooltipPrimitive.Arrow.Props) {
  return (
    <TooltipPrimitive.Arrow
      data-slot="tooltip-arrow"
      {...props}
      class={cn(
        'data-[side=bottom]:top-[-7px] data-[side=left]:right-[-12px] data-[side=left]:rotate-90 data-[side=right]:left-[-12px] data-[side=right]:-rotate-90 data-[side=top]:bottom-[-7px] data-[side=top]:rotate-180',
        props.class,
      )}
    >
      <svg width="20" height="10" viewBox="0 0 20 10" fill="none">
        <path
          d="M9.66437 2.60207L4.80758 6.97318C4.07308 7.63423 3.11989 8 2.13172 8H0V10H20V8H18.5349C17.5468 8 16.5936 7.63423 15.8591 6.97318L11.0023 2.60207C10.622 2.2598 10.0447 2.25979 9.66437 2.60207Z"
          class="fill-ph-mustard-yellow"
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
    </TooltipPrimitive.Arrow>
  )
}

function TooltipPositioner(componentProps: TooltipPrimitive.Positioner.Props) {
  const props = defaultProps(componentProps, {
    align: 'start',
    alignOffset: 10,
    arrowPadding: 15,
    side: 'bottom',
    sideOffset: 10,
  })
  const [local, rest] = splitProps(props, ['class'])
  return <TooltipPrimitive.Positioner class={cn('isolate z-50', local.class)} {...rest} />
}

const TooltipPortal = TooltipPrimitive.Portal

export { Tooltip, TooltipArrow, TooltipPopup, TooltipPortal, TooltipPositioner, TooltipProvider, TooltipTrigger }
