import { cn } from '@/lib/utils'
import { ClientOnly } from '@tanstack/solid-router'
import { XIcon } from 'lucide-solid'
import { mergeProps, splitProps, type ComponentProps } from 'solid-js'
import { useFloatingContext } from '../game-ui/FloatingPanel'
import { Button } from './button'

function Card(props: ComponentProps<'div'>) {
  const [local, rest] = splitProps(props, ['class'])
  return (
    <ClientOnly>
      <div
        data-slot="card"
        class={cn(
          'group/card flex flex-col overflow-hidden border-2 border-input/30 rounded-base bg-card text-sm text-card-foreground ring-1 ring-foreground/10 has-data-[slot=card-footer]:pb-0 has-[>img:first-child]:pt-0 *:[img:first-child]:rounded-t-base *:[img:last-child]:rounded-b-base',
          local.class,
        )}
        {...rest}
      />
    </ClientOnly>
  )
}

function CardHeader(props: ComponentProps<'div'>) {
  const [local, rest] = splitProps(props, ['class', 'ref'])
  const floatingContext = useFloatingContext()
  return (
    <ClientOnly>
      <div
        data-slot="card-header"
        class={cn(
          'group/card-header @container/card-header grid auto-rows-min items-center gap-1 rounded-t-base px-3 has-data-[slot=card-action]:grid-cols-[1fr_auto] has-data-[slot=card-description]:grid-rows-[auto_auto] select-none border-input/10 border-b py-2',
          local.class,
        )}
        ref={(el) => {
          if (typeof local.ref === 'function') {
            local.ref(el)
          } else {
            local.ref = el
          }
          floatingContext?.handleRef(el)
        }}
        {...rest}
      />
    </ClientOnly>
  )
}

function CardTitle(props: ComponentProps<'div'>) {
  const [local, rest] = splitProps(props, ['class'])
  return (
    <ClientOnly>
      <div data-slot="card-title" class={cn('leading-none font-medium text-sm', local.class)} {...rest} />
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

function CardAction(componentProps: ComponentProps<'div'>) {
  let ref!: HTMLDivElement
  const props = mergeProps({ actionType: 'default' as const }, componentProps)
  const [local, rest] = splitProps(props, ['class', 'ref'])
  const floatingContext = useFloatingContext()

  return (
    <ClientOnly>
      <div
        data-slot="card-action"
        data-no-drag={!!floatingContext?.draggable && !!ref.closest('[data-slot="card-header"]')}
        class={cn('col-start-2 row-span-2 row-start-1 self-start justify-self-end', local.class)}
        ref={(el) => {
          if (typeof local.ref === 'function') {
            local.ref(el)
          } else {
            local.ref = el
          }
          ref = el
        }}
        {...rest}
      />
    </ClientOnly>
  )
}

function CardCloseAction(componentProps: ComponentProps<'div'>) {
  return (
    <CardAction {...componentProps}>
      <Button variant="plain" size="icon-xs" class="hover:[&_svg]:rotate-90 focus:[&_svg]:rotate-90">
        <XIcon />
      </Button>
    </CardAction>
  )
}

function CardContent(props: ComponentProps<'div'>) {
  const [local, rest] = splitProps(props, ['class'])
  return (
    <ClientOnly>
      <div data-slot="card-content" class={cn('px-3', local.class)} {...rest} />
    </ClientOnly>
  )
}

function CardFooter(props: ComponentProps<'div'>) {
  const [local, rest] = splitProps(props, ['class'])
  return (
    <ClientOnly>
      <div
        data-slot="card-footer"
        class={cn('flex items-center rounded-b-base border-t border-input/10 p-3', local.class)}
        {...rest}
      />
    </ClientOnly>
  )
}

export { Card, CardAction, CardCloseAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle }
