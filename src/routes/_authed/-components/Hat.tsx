import { assets } from '@/routeAssets.gen'
import { cn } from 'cn'
import { splitProps, type JSX } from 'solid-js'

export function Hat(props: JSX.HTMLAttributes<HTMLSpanElement> & { hat: number }) {
  const [local, rest] = splitProps(props, ['hat', 'class', 'style'])
  return (
    <span
      class={cn('hat', local.class)}
      style={{
        '--hat-index': local.hat,
        '--bg': `url(${assets['/_authed/']['hats.png'].src})`,
      }}
      {...rest}
    />
  )
}
