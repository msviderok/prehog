import { cn } from '@/lib/utils'
import { Toggle as TogglePrimitive } from '@msviderok/base-ui-solid/toggle'
import { type VariantProps } from 'class-variance-authority'
import { mergeProps, splitProps } from 'solid-js'
import { Button, buttonVariants } from './button'

function Toggle(props: TogglePrimitive.Props & VariantProps<typeof buttonVariants>) {
  const mergedProps = mergeProps({ variant: 'default' as const, size: 'default' as const }, props)
  const [local, rest] = splitProps(mergedProps, ['class', 'variant', 'size'])
  const renderProp = mergeProps({ component: Button }, rest.render)
  return (
    <TogglePrimitive
      data-slot="toggle"
      {...rest}
      render={renderProp}
      class={cn(
        buttonVariants({
          variant: local.variant,
          size: local.size,
          class: local.class,
        }),
      )}
    />
  )
}

export { Toggle }
