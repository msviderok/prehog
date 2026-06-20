import { cn, defaultProps } from '@/lib/utils'
import { splitProps, type ComponentProps } from 'solid-js'

function Skeleton(componentProps: ComponentProps<'div'> & { variant?: 'default' | 'overlay' }) {
  const props = defaultProps(componentProps, { variant: 'default' })
  const [local, rest] = splitProps(props, ['class', 'variant'])
  return (
    <div
      data-slot="skeleton"
      class={cn('animate-pulse bg-muted', local.variant === 'overlay' && 'bg-muted/30', local.class)}
      {...rest}
    />
  )
}

export { Skeleton }
