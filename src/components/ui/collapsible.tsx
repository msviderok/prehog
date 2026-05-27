import { ClientOnly } from '@tanstack/solid-router'
import { Collapsible as CollapsiblePrimitive } from '@msviderok/base-ui-solid/collapsible'
import { Button, buttonVariants } from './button'
import { mergeProps, splitProps } from 'solid-js'
import { type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

function Collapsible(props: CollapsiblePrimitive.Root.Props) {
  return (
    <ClientOnly>
      <CollapsiblePrimitive.Root data-slot="collapsible" {...props} />
    </ClientOnly>
  )
}

function CollapsibleTrigger(props: CollapsiblePrimitive.Trigger.Props & VariantProps<typeof buttonVariants>) {
  const mergedProps = mergeProps({ variant: 'default' as const, size: 'default' as const }, props)
  const [local, rest] = splitProps(mergedProps, ['class', 'variant', 'size'])
  return (
    <ClientOnly>
      <CollapsiblePrimitive.Trigger
        data-slot="collapsible-trigger"
        render={{ component: Button }}
        class={cn(
          buttonVariants({
            variant: local.variant,
            size: local.size,
            className: local.class,
          }),
        )}
        {...rest}
      />
    </ClientOnly>
  )
}

function CollapsibleContent(props: CollapsiblePrimitive.Panel.Props) {
  return (
    <ClientOnly>
      <CollapsiblePrimitive.Panel data-slot="collapsible-content" {...props} />
    </ClientOnly>
  )
}

export { Collapsible, CollapsibleContent, CollapsibleTrigger }
