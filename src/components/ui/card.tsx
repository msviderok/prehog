import { cn } from '@/lib/utils'
import { useDraggable } from '@dnd-kit/solid'
import { ClientOnly } from '@tanstack/solid-router'
import { createContext, mergeProps, onMount, splitProps, useContext, type ComponentProps } from 'solid-js'
import { untrack } from 'solid-js/web'

type UseDraggableOutput = ReturnType<typeof useDraggable>

const CardContext = createContext<{ draggable: UseDraggableOutput | undefined }>({ draggable: undefined })

function Card(
  props: Omit<ComponentProps<'div'>, 'id'> & {
    size?: 'default' | 'sm'
  } & (
      | {
          /**
           * @static **Not reactive**. When `true`, it will use the `useDraggable` hook from `@dnd-kit/solid` to make the card draggable.
           *
           */
          floating: true
          id: string
        }
      | {
          floating?: false
          id?: string | undefined
        }
    ),
) {
  const mergedProps = mergeProps({ size: 'sm' as const, floating: false }, props)
  const [local, rest] = splitProps(mergedProps, ['class', 'size', 'floating', 'ref'])

  const context = {
    draggable: untrack(() => props.floating)
      ? useDraggable({
          get id() {
            return props.id!
          },
        })
      : undefined,
  }

  return (
    <ClientOnly>
      <CardContext.Provider value={context}>
        <div
          data-slot="card"
          data-size={local.size}
          data-floating={local.floating}
          class={cn(
            'group/card flex flex-col gap-4 overflow-hidden border-2 border-input/30 rounded-base bg-card py-4 text-sm text-card-foreground ring-1 ring-foreground/10 has-data-[slot=card-footer]:pb-0 has-[>img:first-child]:pt-0 data-[size=sm]:gap-3 data-[size=sm]:py-3 data-[size=sm]:has-data-[slot=card-footer]:pb-0 *:[img:first-child]:rounded-t-base *:[img:last-child]:rounded-b-base',
            local.floating &&
              'shadow-[0_0_5px_3px] shadow-transparent py-0! focus:border-tint-primary/10 focus-within:border-tint-primary/10 data-dnd-dragging:not-data-dnd-dropping:border-tint-primary/10 focus-within:shadow-shade-primary/30 data-dnd-dragging:not-data-dnd-dropping:shadow-shade-primary/30 focus:shadow-shade-primary/30 fixed top-0 left-0 z-1000 transition-[border,box-shadow] ease-out duration-100 data-dnd-dropping:duration-0',
            local.class,
          )}
          ref={(el) => {
            if (typeof local.ref === 'function') {
              local.ref(el)
            } else {
              local.ref = el
            }
            if (context.draggable != null) {
              context.draggable.ref(el)
            }
          }}
          {...rest}
        />
      </CardContext.Provider>
    </ClientOnly>
  )
}

function CardHeader(props: ComponentProps<'div'>) {
  const [local, rest] = splitProps(props, ['class', 'ref'])
  const context = useContext(CardContext)
  return (
    <ClientOnly>
      <div
        data-slot="card-header"
        class={cn(
          'group/card-header @container/card-header grid auto-rows-min items-start gap-1 rounded-t-base px-4 group-data-[size=sm]/card:px-3 has-data-[slot=card-action]:grid-cols-[1fr_auto] has-data-[slot=card-description]:grid-rows-[auto_auto] [.border-b]:pb-4 group-data-[size=sm]/card:[.border-b]:pb-3 select-none',
          local.class,
        )}
        ref={(el) => {
          if (typeof local.ref === 'function') {
            local.ref(el)
          } else {
            local.ref = el
          }
          if (context.draggable != null) {
            context.draggable.handleRef(el)
          }
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
      <div
        data-slot="card-title"
        class={cn('text-base leading-none font-medium group-data-[size=sm]/card:text-sm', local.class)}
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
  let ref!: HTMLDivElement
  const [local, rest] = splitProps(props, ['class', 'ref'])
  const context = useContext(CardContext)

  onMount(() => {
    if (context.draggable && ref.closest('[data-slot="card-header"]')) {
      ref.dataset.noDrag = 'true'
    }
  })

  return (
    <ClientOnly>
      <div
        data-slot="card-action"
        class={cn('col-start-2 row-span-2 row-start-1 self-start justify-self-end', local.class)}
        {...rest}
        ref={(el) => {
          if (typeof local.ref === 'function') {
            local.ref(el)
          } else {
            ref = el
          }
          ref = el
        }}
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
        class={cn(
          'flex items-center rounded-b-base border-t bg-muted/50 p-4 group-data-[size=sm]/card:p-3',
          local.class,
        )}
        {...rest}
      />
    </ClientOnly>
  )
}

export { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle }
