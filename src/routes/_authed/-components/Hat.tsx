import { HAT_INDEX, type HatType } from '@/lib/constants'
import { assets } from '@/routeAssets.gen'
import { cn } from 'cn'
import { splitProps, type JSX } from 'solid-js'

export function Hat(props: JSX.HTMLAttributes<HTMLSpanElement> & { hat: HatType }) {
  const [local, rest] = splitProps(props, ['hat', 'class', 'style'])
  return (
    <span
      class={cn('hat', local.class)}
      style={{
        '--hat-index': HAT_INDEX[local.hat],
        '--bg': `url(${assets['/_authed/']['hats.png'].src})`,
      }}
      {...rest}
    />
  )
}
