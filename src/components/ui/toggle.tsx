import { Toggle as TogglePrimitive } from '@msviderok/base-ui-solid/toggle'
import { type VariantProps } from 'class-variance-authority'
import { mergeProps, splitProps } from 'solid-js'
import { Button, type buttonVariants } from './button'

function Toggle(props: TogglePrimitive.Props & VariantProps<typeof buttonVariants>) {
  const mergedProps = mergeProps({ variant: 'default' as const, size: 'default' as const }, props)
  const [local, rest] = splitProps(mergedProps, ['class', 'variant', 'size', 'render'])
  return (
    <TogglePrimitive
      data-slot="toggle"
      {...rest}
      render={local.render ?? { component: Button, size: local.size, variant: local.variant, class: local.class }}
    />
  )
}

export { Toggle }
