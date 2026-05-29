import { Collapsible as CollapsiblePrimitive } from '@msviderok/base-ui-solid/collapsible'
import { ClientOnly } from '@tanstack/solid-router'

function Collapsible(props: CollapsiblePrimitive.Root.Props) {
  return (
    <ClientOnly>
      <CollapsiblePrimitive.Root data-slot="collapsible" {...props} />
    </ClientOnly>
  )
}

function CollapsibleTrigger(props: CollapsiblePrimitive.Trigger.Props) {
  return (
    <ClientOnly>
      <CollapsiblePrimitive.Trigger data-slot="collapsible-trigger" {...props} />
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
