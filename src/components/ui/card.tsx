import { cn } from '@/lib/utils'
import { useDraggable } from '@dnd-kit/solid'
import { ClientOnly } from '@tanstack/solid-router'
import {
  createContext,
  mergeProps,
  splitProps,
  useContext,
  type Accessor,
  type ComponentProps,
  type ParentProps,
} from 'solid-js'
import { Dynamic, Portal, untrack } from 'solid-js/web'
import { useGlobalState } from '../GlobalStateContext'

type UseDraggableOutput = ReturnType<typeof useDraggable>

const CardContext = createContext<
  | {
      draggable: UseDraggableOutput | undefined
      isOpen: Accessor<boolean>
    }
  | undefined
>()

function Card(
  props: Omit<ComponentProps<'div'>, 'id'> & {
    size?: 'default' | 'sm'
  } & (
      | {
          /**
           * @static **Not reactive**. When `true`, it will use the `useDraggable` hook from `@dnd-kit/solid` to make the card draggable.
           */
          floating: true
          id: string
        }
      | {
          /**
           * @static **Not reactive**. When `true`, it will use the `useDraggable` hook from `@dnd-kit/solid` to make the card draggable.
           */
          floating?: false | undefined
          id?: string | undefined
        }
    ),
) {
  const mergedProps = mergeProps({ size: 'sm' as const, floating: false }, props)
  const [local, rest] = splitProps(mergedProps, ['class', 'size', 'floating', 'ref', 'id'])
  const isFloating = untrack(() => props.floating)
  const { isFloatingPanelOpen } = useGlobalState()

  const context = {
    draggable: isFloating
      ? useDraggable({
          get id() {
            return local.id!
          },
        })
      : undefined,
    isOpen: () => (local.id ? isFloatingPanelOpen(local.id) : false),
  }

  return (
    <ClientOnly>
      <CardContext.Provider value={context}>
        <Dynamic component={(p: ParentProps) => (isFloating ? <Portal>{p.children}</Portal> : <>{p.children}</>)}>
          <div
            data-slot="card"
            data-size={local.size}
            data-floating={local.floating}
            id={local.id}
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
        </Dynamic>
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
          if (context?.draggable != null) {
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

function CardAction(componentProps: ComponentProps<'div'>) {
  let ref!: HTMLDivElement
  const props = mergeProps({ actionType: 'default' as const }, componentProps)
  const [local, rest] = splitProps(props, ['class', 'ref'])
  const context = useContext(CardContext)

  return (
    <ClientOnly>
      <div
        data-slot="card-action"
        data-no-drag={!!context?.draggable && !!ref.closest('[data-slot="card-header"]')}
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
