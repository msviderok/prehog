import { ClientOnly } from '@tanstack/solid-router'
import { Toggle as TogglePrimitive } from '@msviderok/base-ui-solid/toggle'
import { ToggleGroup as ToggleGroupPrimitive } from '@msviderok/base-ui-solid/toggle-group'
import { type VariantProps } from 'class-variance-authority'
import { createContext, mergeProps, splitProps, useContext, type JSX } from 'solid-js'

import { toggleVariants } from '@/components/ui/toggle'
import { cn } from '@/lib/utils'

const ToggleGroupContext = createContext<
  VariantProps<typeof toggleVariants> & {
    spacing?: number
    orientation?: 'horizontal' | 'vertical'
  }
>({
  size: 'default',
  variant: 'default',
  spacing: 0,
  orientation: 'horizontal',
})

function ToggleGroup(
  props: ToggleGroupPrimitive.Props &
    VariantProps<typeof toggleVariants> & {
      spacing?: number
      orientation?: 'horizontal' | 'vertical'
    },
) {
  const mergedProps = mergeProps({ spacing: 0, orientation: 'horizontal' as const }, props)
  const [local, rest] = splitProps(mergedProps, ['class', 'variant', 'size', 'spacing', 'orientation', 'children'])
  return (
    <ClientOnly>
      <ToggleGroupPrimitive
        data-slot="toggle-group"
        data-variant={local.variant}
        data-size={local.size}
        data-spacing={local.spacing}
        data-orientation={local.orientation}
        style={{ '--gap': local.spacing } as JSX.CSSProperties}
        class={cn(
          'group/toggle-group flex w-fit flex-row items-center gap-[--spacing(var(--gap))] rounded-md data-[size=sm]:rounded-[min(var(--radius-md),8px)] data-vertical:flex-col data-vertical:items-stretch',
          local.class,
        )}
        {...rest}
      >
        <ToggleGroupContext.Provider
          value={{
            variant: local.variant,
            size: local.size,
            spacing: local.spacing,
            orientation: local.orientation,
          }}
        >
          {local.children}
        </ToggleGroupContext.Provider>
      </ToggleGroupPrimitive>
    </ClientOnly>
  )
}

function ToggleGroupItem(props: TogglePrimitive.Props & VariantProps<typeof toggleVariants>) {
  const mergedProps = mergeProps({ variant: 'default' as const, size: 'default' as const }, props)
  const [local, rest] = splitProps(mergedProps, ['class', 'children', 'variant', 'size'])
  const context = useContext(ToggleGroupContext)

  return (
    <ClientOnly>
      <TogglePrimitive
        data-slot="toggle-group-item"
        data-variant={context.variant || local.variant}
        data-size={context.size || local.size}
        data-spacing={context.spacing}
        class={cn(
          'shrink-0 group-data-[spacing=0]/toggle-group:rounded-none group-data-[spacing=0]/toggle-group:px-2 focus:z-10 focus-visible:z-10 group-data-[spacing=0]/toggle-group:has-data-[icon=inline-end]:pr-1.5 group-data-[spacing=0]/toggle-group:has-data-[icon=inline-start]:pl-1.5 group-data-horizontal/toggle-group:data-[spacing=0]:first:rounded-l-md group-data-vertical/toggle-group:data-[spacing=0]:first:rounded-t-md group-data-horizontal/toggle-group:data-[spacing=0]:last:rounded-r-md group-data-vertical/toggle-group:data-[spacing=0]:last:rounded-b-md group-data-horizontal/toggle-group:data-[spacing=0]:data-[variant=outline]:border-l-0 group-data-vertical/toggle-group:data-[spacing=0]:data-[variant=outline]:border-t-0 group-data-horizontal/toggle-group:data-[spacing=0]:data-[variant=outline]:first:border-l group-data-vertical/toggle-group:data-[spacing=0]:data-[variant=outline]:first:border-t',
          toggleVariants({
            variant: context.variant || local.variant,
            size: context.size || local.size,
          }),
          local.class,
        )}
        {...rest}
      >
        {local.children}
      </TogglePrimitive>
    </ClientOnly>
  )
}

export { ToggleGroup, ToggleGroupItem }
