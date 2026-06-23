import { Tabs as TabsPrimitive } from '@msviderok/base-ui-solid/tabs'
import { cva, type VariantProps } from 'class-variance-authority'
import { mergeProps, splitProps } from 'solid-js'
import { cn } from '@/lib/utils'

function Tabs(props: TabsPrimitive.Root.Props) {
  const mergedProps = mergeProps({ orientation: 'horizontal' as const }, props)
  const [local, rest] = splitProps(mergedProps, ['class', 'orientation'])
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      data-orientation={local.orientation}
      class={cn('group/tabs flex data-horizontal:flex-col gap-0.5', local.class)}
      {...rest}
    />
  )
}

const tabsListVariants = cva(
  'group/tabs-list inline-flex w-full items-center justify-center rounded-lg text-muted-foreground group-data-horizontal/tabs:h-8 group-data-vertical/tabs:h-fit group-data-vertical/tabs:flex-col data-[variant=line]:rounded-none',
  {
    variants: {
      variant: {
        default: 'bg-muted',
        line: 'bg-transparent',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

function TabsList(props: TabsPrimitive.List.Props & VariantProps<typeof tabsListVariants>) {
  const mergedProps = mergeProps({ variant: 'default' as const }, props)
  const [local, rest] = splitProps(mergedProps, ['class', 'variant'])
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      data-variant={local.variant}
      class={cn(tabsListVariants({ variant: local.variant }), local.class)}
      {...rest}
    />
  )
}

function TabsTrigger(props: TabsPrimitive.Tab.Props) {
  const [local, rest] = splitProps(props, ['class'])
  return (
    <TabsPrimitive.Tab
      data-slot="tabs-trigger"
      class={cn(
        "relative inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-md px-1.5 py-0.5 text-xs font-medium whitespace-nowrap text-foreground/60 transition-all group-data-vertical/tabs:w-full group-data-vertical/tabs:justify-start group-data-vertical/tabs:py-[calc(--spacing(1.25))] hover:text-foreground focus-visible:outline-hidden disabled:pointer-events-none disabled:opacity-50 has-data-[icon=inline-end]:pr-1 has-data-[icon=inline-start]:pl-1 aria-disabled:pointer-events-none aria-disabled:opacity-50 dark:text-muted-foreground dark:hover:text-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.5 cursor-pointer",
        'group-data-[variant=line]/tabs-list:bg-transparent dark:group-data-[variant=line]/tabs-list:rounded-none group-data-[variant=line]/tabs-list:rounded-none group-data-[variant=line]/tabs-list:data-[selected=]:bg-tint-card/15 group-data-[variant=line]/tabs-list:data-[selected=]:border-none dark:group-data-[variant=line]/tabs-list:data-[selected=]:bg-tint-card/15 group-data-[variant=line]/tabs-list:data-[selected=]:text-accent group-data-[variant=line]/tabs-list:data-[selected=]:after:bg-accent group-data-[variant=line]/tabs-list:h-full',
        'data-[selected=]:bg-background data-[selected=]:text-foreground dark:data-[selected=]:border-input dark:data-[selected=]:bg-input/30 dark:data-[selected=]:text-foreground',
        'after:absolute after:bg-foreground after:opacity-10 after:transition-opacity group-data-horizontal/tabs:after:inset-x-0 group-data-horizontal/tabs:after:-bottom-0.5 group-data-horizontal/tabs:after:h-0.5 group-data-vertical/tabs:after:inset-y-0 group-data-vertical/tabs:after:-right-1 group-data-vertical/tabs:after:w-0.5 group-data-[variant=line]/tabs-list:data-[selected=]:after:opacity-100',
        local.class,
      )}
      {...rest}
    />
  )
}

function TabsContent(props: TabsPrimitive.Panel.Props) {
  const [local, rest] = splitProps(props, ['class'])
  return (
    <TabsPrimitive.Panel
      data-slot="tabs-content"
      class={cn('flex-1 text-xs/relaxed outline-none', local.class)}
      {...rest}
    />
  )
}

export { Tabs, TabsContent, TabsList, tabsListVariants, TabsTrigger }
