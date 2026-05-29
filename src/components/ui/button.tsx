import { cn } from '@/lib/utils'
import { cva, type VariantProps } from 'class-variance-authority'
import { mergeProps, splitProps } from 'solid-js'
import { Button as ButtonPrimitive } from './button-primitive'

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-base text-sm bg-(--v-color) text-shade-(--v-color)/30 border-shade-(--v-color)/30 font-base ring-offset-white transition-all gap-2 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-pressed:[--boxShadowY-dynamic:0px] data-pressed:bg-shade-(--v-color)/20 data-pressed:text-tint-(--v-color)/60 data-pressed:border-tint-(--v-color)/60 border-2 hover:[--boxShadowY-dynamic:3px] active:[--boxShadowY-dynamic:0px] ease-out duration-150',
  {
    variants: {
      variant: {
        default: 'shadow-shadow v-primary translate-y-[calc(var(--spacing-boxShadowY)-var(--boxShadowY-dynamic))]',
        plain:
          '[--boxShadowY-dynamic:0px] translate-y-0 hover:[--boxShadowY-dynamic:0] border-transparent bg-gray-100/10 active:shadow-primary ',
        outline:
          'active:scale-90 hover:border-shade-(--v-color)/30 hover:text-shade-(--v-color)/30 hover:bg-tint-(--v-color)/10 hover:scale-110 data-pressed:hover:scale-100 data-pressed:border-shade-(--v-color)/10',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'size-6 [&_svg]:size-3.5',
        icon: 'size-8 [&_svg]:size-4.5',
        'icon-xs': 'size-5 [&_svg]:size-3.5',
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
  const [local, rest] = splitProps(mergedProps, ['class', 'size', 'variant'])
  return (
    <ButtonPrimitive
      data-slot="button"
      class={cn(buttonVariants({ size: local.size, variant: local.variant, class: local.class }))}
      {...rest}
    />
  )
}

export { Button, buttonVariants }
