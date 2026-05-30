import { cn } from '@/lib/utils'
import { useDraggable } from '@dnd-kit/solid'
import { ClientOnly } from '@tanstack/solid-router'
import { XIcon } from 'lucide-solid'
import {
  createContext,
  createEffect,
  createMemo,
  mergeProps,
  Show,
  splitProps,
  useContext,
  type Accessor,
  type ComponentProps,
  type ParentProps,
} from 'solid-js'
import { Dynamic, Portal, untrack } from 'solid-js/web'
import { useGlobalState } from '../GlobalStateContext'
import { Button } from './button'

type UseDraggableOutput = ReturnType<typeof useDraggable>

interface CardContextState {
  draggable: UseDraggableOutput | undefined
  isOpen: Accessor<boolean>
}

const CardContext = createContext<CardContextState | undefined>()

function Card(
  props: Omit<ComponentProps<'div'>, 'id'> &
    (
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
  let ref!: HTMLDivElement
  const mergedProps = mergeProps({ floating: false }, props)
  const [local, rest] = splitProps(mergedProps, ['class', 'floating', 'ref', 'id'])
  const { isFloatingPanelOpen, getFloatingPanel } = useGlobalState()
  const isFloating = untrack(() => props.floating)

  const context: CardContextState = {
    draggable: undefined,
    isOpen: () => (local.id ? isFloatingPanelOpen(local.id) : false),
  }

  if (isFloating) {
    context.draggable = useDraggable({
      get id() {
        return local.id!
      },
    })

    createEffect(() => {
      if (ref && local.id) {
        const panel = getFloatingPanel(local.id)
        if (!panel) return
        ref.style.transform = `translate(${panel.x ?? 0}px, ${panel.y ?? 0}px)`
      }
    })
  }

  return (
    <ClientOnly>
      <CardContext.Provider value={context}>
        <Dynamic
          component={(p: ParentProps) =>
            isFloating ? (
              <Portal>
                <Show when={isFloatingPanelOpen(local.id!)}>{p.children}</Show>
              </Portal>
            ) : (
              <>{p.children}</>
            )
          }
        >
          <div
            data-slot="card"
            data-floating={local.floating}
            id={local.id}
            onClick={(e) => {
              e.stopPropagation()
            }}
            class={cn(
              'group/card flex flex-col overflow-hidden border-2 border-input/30 rounded-base bg-card text-sm text-card-foreground ring-1 ring-foreground/10 has-data-[slot=card-footer]:pb-0 has-[>img:first-child]:pt-0 *:[img:first-child]:rounded-t-base *:[img:last-child]:rounded-b-base',
              local.floating &&
                'shadow-[0_0_5px_3px] shadow-transparent py-0! focus:border-tint-primary/10 focus-within:border-tint-primary/10 data-dnd-dragging:not-data-dnd-dropping:border-tint-primary/10 focus-within:shadow-shade-primary/30 data-dnd-dragging:not-data-dnd-dropping:shadow-shade-primary/30 focus:shadow-shade-primary/30 fixed top-0 left-0 z-1000 transition-[border,box-shadow] ease-out duration-100 data-dnd-dropping:duration-0',
              local.class,
            )}
            ref={(el) => {
              ref = el
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
          'group/card-header @container/card-header grid auto-rows-min items-center gap-1 rounded-t-base px-3 has-data-[slot=card-action]:grid-cols-[1fr_auto] has-data-[slot=card-description]:grid-rows-[auto_auto] select-none border-input/10 border-b py-2',
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
