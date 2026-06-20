import { defaultProps } from '@/lib/utils'
import { Toggle as TogglePrimitive } from '@msviderok/base-ui-solid/toggle'
import { splitProps } from 'solid-js'
import { Button, type ExtraButtonProps } from './button'

function Toggle(componentProps: TogglePrimitive.Props & ExtraButtonProps) {
  const props = defaultProps(componentProps, { variant: 'default', size: 'default' })
  const [buttonProps, rest] = splitProps(props, ['class', 'variant', 'size'])
  const restPropsWithRender = defaultProps(rest, { render: (p) => <Button {...p} {...buttonProps} /> })
  return <TogglePrimitive data-slot="toggle" {...restPropsWithRender} />
}

export { Toggle }
