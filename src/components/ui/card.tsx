import { cn } from '@/lib/utils'
import { ClientOnly } from '@tanstack/solid-router'
import { splitProps, mergeProps, type ComponentProps } from 'solid-js'

function Card(props: ComponentProps<'div'> & { size?: 'default' | 'sm' }) {
  const mergedProps = mergeProps({ size: 'sm' as const }, props)
  const [local, rest] = splitProps(mergedProps, ['class', 'size'])
  return (
    <ClientOnly>
      <div
        data-slot="card"
        data-size={local.size}
        class={cn(
          'group/card flex flex-col gap-4 overflow-hidden rounded-xl bg-card py-4 text-sm text-card-foreground ring-1 ring-foreground/10 has-data-[slot=card-footer]:pb-0 has-[>img:first-child]:pt-0 data-[size=sm]:gap-3 data-[size=sm]:py-3 data-[size=sm]:has-data-[slot=card-footer]:pb-0 *:[img:first-child]:rounded-t-xl *:[img:last-child]:rounded-b-xl',
          local.class,
        )}
        {...rest}
      />
    </ClientOnly>
  )
}

function CardHeader(props: ComponentProps<'div'>) {
  const [local, rest] = splitProps(props, ['class'])
  return (
    <ClientOnly>
      <div
        data-slot="card-header"
        class={cn(
          'group/card-header @container/card-header grid auto-rows-min items-start gap-1 rounded-t-xl px-4 group-data-[size=sm]/card:px-3 has-data-[slot=card-action]:grid-cols-[1fr_auto] has-data-[slot=card-description]:grid-rows-[auto_auto] [.border-b]:pb-4 group-data-[size=sm]/card:[.border-b]:pb-3',
          local.class,
        )}
        {...rest}
      />
    </ClientOnly>
  )
}

function CardTitle(props: ComponentProps<'div'>) {
  const [local, rest] = splitProps(props, ['class'])
  return (
    <ClientOnly>
      <div
        data-slot="card-title"
        class={cn('cn-font-heading text-base leading-snug font-medium group-data-[size=sm]/card:text-sm', local.class)}
        {...rest}
      />
    </ClientOnly>
  )
}

function CardDescription(props: ComponentProps<'div'>) {
  const [local, rest] = splitProps(props, ['class'])
  return (
    <ClientOnly>
      <div data-slot="card-description" class={cn('text-sm text-muted-foreground', local.class)} {...rest} />
    </ClientOnly>
  )
}

function CardAction(props: ComponentProps<'div'>) {
  const [local, rest] = splitProps(props, ['class'])
  return (
    <ClientOnly>
      <div
        data-slot="card-action"
        class={cn('col-start-2 row-span-2 row-start-1 self-start justify-self-end', local.class)}
        {...rest}
      />
    </ClientOnly>
  )
}

function CardContent(props: ComponentProps<'div'>) {
  const [local, rest] = splitProps(props, ['class'])
  return (
    <ClientOnly>
      <div data-slot="card-content" class={cn('px-4 group-data-[size=sm]/card:px-3', local.class)} {...rest} />
    </ClientOnly>
  )
}

function CardFooter(props: ComponentProps<'div'>) {
  const [local, rest] = splitProps(props, ['class'])
  return (
    <ClientOnly>
      <div
        data-slot="card-footer"
        class={cn('flex items-center rounded-b-xl border-t bg-muted/50 p-4 group-data-[size=sm]/card:p-3', local.class)}
        {...rest}
      />
    </ClientOnly>
  )
}

export { Card, CardHeader, CardFooter, CardTitle, CardAction, CardDescription, CardContent }
