import { cn } from 'cn'
import { splitProps, type JSX } from 'solid-js'

export function Prose(props: JSX.HTMLAttributes<HTMLDivElement>) {
  const [local, rest] = splitProps(props, ['class'])
  return <div class={cn('typeset typeset-notes max-w-[33em]', local.class)} {...rest} />
}
