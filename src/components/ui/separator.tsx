import { ClientOnly } from '@tanstack/solid-router'
import { Separator as SeparatorPrimitive } from '@msviderok/base-ui-solid/separator'
import { mergeProps, splitProps } from 'solid-js'

import { cn } from '@/lib/utils'

function Separator(props: SeparatorPrimitive.Props) {
  const mergedProps = mergeProps({ orientation: 'horizontal' as const }, props)
  const [local, rest] = splitProps(mergedProps, ['class', 'orientation'])
  return (
    <ClientOnly>
      <SeparatorPrimitive
        data-slot="separator"
        orientation={local.orientation}
        class={cn(
          'shrink-0 bg-muted data-horizontal:h-0.5 data-horizontal:w-full data-vertical:w-px data-vertical:self-stretch group-data-[slot=card-header]/card-header:h-2/3 group-data-[slot=card-header]/card-header:self-center',
          local.class,
        )}
        {...rest}
      />
    </ClientOnly>
  )
}

export { Separator }
