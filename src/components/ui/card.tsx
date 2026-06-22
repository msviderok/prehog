import { cn, defaultProps } from '@/lib/utils'
import { cva, type VariantProps } from 'class-variance-authority'
import { XIcon } from 'lucide-solid'
import { createContext, splitProps, useContext, type ComponentProps } from 'solid-js'
import { useFloatingContext } from '../game-ui/FloatingContext'
import { Button } from './button'

const cardVariants = cva(
  'group/card overflow-hidden border-2 border-input/30 rounded-base bg-card text-sm text-card-foreground ring-1 ring-foreground/10 has-data-[slot=card-footer]:pb-0 has-[>img:first-child]:pt-0 *:[img:first-child]:rounded-t-base *:[img:last-child]:rounded-b-base',
  {
    variants: {
      variant: {
        default: 'flex flex-col',
        'rtc-panel': 'w-100 h-min grid grid-rows-[auto_1fr_auto]',
        'chat-panel': 'w-[calc(100vw-1rem)] max-w-100',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

const CardContext = createContext<{ variant: VariantProps<typeof cardVariants>['variant'] }>({ variant: undefined })

function Card(componentProps: ComponentProps<'div'> & VariantProps<typeof cardVariants>) {
  const props = defaultProps(componentProps, { variant: 'default' })
  const [local, rest] = splitProps(props, ['class', 'variant'])
  return (
    <CardContext.Provider
      value={{
        get variant() {
          return local.variant
        },
      }}
    >
      <div
        data-slot="card"
        data-variant={local.variant}
        class={cardVariants({ variant: local.variant, class: local.class })}
        {...rest}
      />
    </CardContext.Provider>
  )
}

function CardHeader(props: ComponentProps<'div'>) {
  const [local, rest] = splitProps(props, ['class', 'ref'])
  const floatingContext = useFloatingContext()
  return (
    <div
      data-slot="card-header"
      class={cn(
        'group/card-header @container/card-header grid auto-rows-min items-center gap-1 rounded-t-base px-3 has-data-[slot=card-action]:grid-cols-[1fr_auto] has-data-[slot=card-description]:grid-rows-[auto_auto] select-none border-input/10 border-b-2 py-2 group-data-[variant=rtc-panel]/card:bg-shade-card/50 group-data-[variant=rtc-panel]/card:items-center group-data-[variant=rtc-panel]/card:flex group-data-[variant=rtc-panel]/card:gap-2 group-data-[variant=chat-panel]/card:border-b-2 group-data-[variant=chat-panel]/card:border-muted/50 group-data-[variant=chat-panel]/card:py-0 group-data-[variant=chat-panel]/card:flex group-data-[variant=chat-panel]/card:justify-between group-data-[variant=chat-panel]/card:items-center group-data-[variant=chat-panel]/card:pl-1',
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
  )
}

function CardTitle(props: ComponentProps<'div'>) {
  const [local, rest] = splitProps(props, ['class'])
  return <div data-slot="card-title" class={cn('leading-none font-medium text-sm', local.class)} {...rest} />
}

function CardDescription(props: ComponentProps<'div'>) {
  const [local, rest] = splitProps(props, ['class'])
  return <div data-slot="card-description" class={cn('text-sm text-muted-foreground', local.class)} {...rest} />
}

function CardAction(props: ComponentProps<'div'>) {
  let ref!: HTMLDivElement
  const [local, rest] = splitProps(props, ['class', 'ref'])
  const floatingContext = useFloatingContext()

  return (
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
    <div
      data-slot="card-content"
      class={cn(
        'px-3 group-data-[variant=rtc-panel]/card:p-0 group-data-[variant=rtc-panel]/card:relative group-data-[variant=rtc-panel]/card:flex group-data-[variant=rtc-panel]/card:flex-col group-data-[variant=rtc-panel]/card:items-center group-data-[variant=rtc-panel]/card:justify-center group-data-[variant=rtc-panel]/card:size-full group-data-[variant=rtc-panel]/card:gap-2 group-data-[variant=rtc-panel]/card:aspect-video',
        local.class,
      )}
      {...rest}
    />
  )
}

function CardFooter(props: ComponentProps<'div'>) {
  const ctx = useContext(CardContext)
  const [local, rest] = splitProps(props, ['class', 'children'])
  return (
    <div
      data-slot="card-footer"
      class={cn(
        'flex items-center rounded-b-base border-t border-input/10 p-3 group-data-[variant=rtc-panel]/card:bg-shade-card/50 group-data-[variant=rtc-panel]/card:justify-center group-data-[variant=chat-panel]/card:p-2.5',
        local.class,
      )}
      {...rest}
    >
      {ctx.variant === 'rtc-panel' ? (
        <div class="group-data-[variant=rtc-panel]/card:grid group-data-[variant=rtc-panel]/card:grid-flow-col group-data-[variant=rtc-panel]/card:auto-cols-fr group-data-[variant=rtc-panel]/card:gap-2">
          {local.children}
        </div>
      ) : (
        local.children
      )}
    </div>
  )
}

export { Card, CardAction, CardCloseAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle }
