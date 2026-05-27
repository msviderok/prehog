import { cn } from '@/lib/utils'
import { cva, type VariantProps } from 'class-variance-authority'
import { mergeProps, splitProps } from 'solid-js'
import { Button as ButtonPrimitive } from './button-primitive'

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-base text-sm font-base ring-offset-white transition-all gap-2 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default:
          'bg-primary border-2 border-border shadow-shadow hover:translate-y-boxShadowY hover:shadow-none data-panel-open:shadow-none data-panel-open:translate-y-boxShadowY data-panel-open:bg-shade-primary/10 data-panel-open:text-tint-primary/100 contrast-color-primary data-panel-open:contrast-color-shade-primary/20 data-popup-open:shadow-none data-popup-open:translate-y-boxShadowY data-popup-open:bg-shade-primary/10 data-popup-open:text-tint-primary/100 data-popup-open:contrast-color-shade-primary/20',
        noShadow: 'text-primary-foreground bg-primary border-2 border-border',
        reverse:
          'text-primary-foreground bg-primary border-2 border-border hover:translate-y-reverseBoxShadowY hover:shadow-shadow',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 px-3',
        lg: 'h-11 px-8',
        icon: 'size-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

function Button(props: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  const mergedProps = mergeProps({ variant: 'default' as const, size: 'default' as const }, props)
  const [local, rest] = splitProps(mergedProps, ['class', 'variant', 'size'])
  return (
    <ButtonPrimitive
      data-slot="button"
      class={cn(
        buttonVariants({
          variant: local.variant,
          size: local.size,
          class: local.class,
        }),
      )}
      {...rest}
    />
  )
}

export { Button, buttonVariants }
