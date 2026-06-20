import { cn, defaultProps } from '@/lib/utils'
import { cva, type VariantProps } from 'class-variance-authority'
import { Show, splitProps, type JSX } from 'solid-js'
import { Button as ButtonPrimitive } from './button-primitive'

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-base text-sm bg-(--v-color) border-shade-(--v-color)/30 font-base transition-all gap-2 [&_svg]:pointer-events-none [&_svg]:shrink-0 focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-transparent focus-visible:ring-offset-accent/30 focus-visible:ring-offset-1 disabled:*:pointer-events-none disabled:opacity-50 border-2 hover:[--boxShadowY-dynamic:3px] active:[--boxShadowY-dynamic:0px] ease-out duration-150 [&_svg]:transition-transform [&_svg]:ease-out [&_svg]:duration-150 cursor-pointer disabled:cursor-not-allowed will-change-transform [&_svg]:will-change-transform',
  {
    variants: {
      variant: {
        default:
          'shadow-shadow translate-y-[calc(var(--spacing-boxShadowY)-var(--boxShadowY-dynamic))] contrast-color-(--v-color) data-pressed:[--boxShadowY-dynamic:0px] data-pressed:bg-shade-(--v-color)/20 data-pressed:text-tint-(--v-color)/60 data-pressed:border-tint-(--v-color)/60',
        // plain:
        //   '[--boxShadowY-dynamic:0px] translate-y-0 hover:[--boxShadowY-dynamic:0] border-shade-white/50 bg-gray-100/10 active:shadow-primary text-shade-white/20  hover:border-shade-white/30 hover:text-shade-white/10 focus:border-shade-white/30 focus:text-shade-white/10',
        outline:
          'not-disabled:hover:border-shade-(--v-color)/30 not-disabled:hover:bg-tint-(--v-color)/10 not-disabled:data-pressed:border-shade-(--v-color)/10',
        toggle:
          'data-pressed:bg-(--v-color) not-[data-pressed]:bg-muted data-pressed:opacity-100 not-[data-pressed]:opacity-50 data-pressed:border-tint-(--v-color)/50 not-[data-pressed]:border-tint-muted/30',
        plain: 'border-none hover:text-accent focus-visible:text-accent bg-foreground/5',
      },
      animate: {
        default: '',
        'scale-icon':
          'not-disabled:hover:[&_svg]:scale-115 not-disabled:focus:[&_svg]:scale-115 will-change-transform transition-transform [&_svg]:will-change-transform [&_svg]:transition-transform',
        scale:
          'not-disabled:active:scale-95 not-disabled:hover:scale-105 not-disabled:focus:scale-105 not-disabled:hover:[&_svg]:scale-105 not-disabled:focus:[&_svg]:scale-105 will-change-transform transition-transform [&_svg]:will-change-transform [&_svg]:transition-transform',
      },
      size: {
        default: 'h-10 px-4 py-2 [&_svg]:size-5',
        md: 'h-8 p-4 text-xs [&_svg]:size-4',
        sm: 'h-6 p-3 text-xs [&_svg]:size-4',
        icon: 'size-8 [&_svg]:size-4.5',
        'icon-xs': 'size-6 [&_svg]:size-3.5',
      },
    },
    defaultVariants: {
      variant: 'default',
      animate: 'scale',
      size: 'default',
    },
  },
)

type ExtraButtonProps = VariantProps<typeof buttonVariants>

function Button(componentProps: ButtonPrimitive.Props & ExtraButtonProps) {
  const props = defaultProps(componentProps, { variant: 'default', size: 'default', animate: 'scale-icon' })
  const [local, rest] = splitProps(props, ['class', 'size', 'variant', 'animate'])
  return <ButtonPrimitive data-slot="button" class={cn(buttonVariants(local))} {...rest} />
}

export { Button, buttonVariants, type ExtraButtonProps }
