import { mergeProps as mergeBaseUiProps } from '@msviderok/base-ui-solid/merge-props'
import { useRender } from '@msviderok/base-ui-solid/use-render'
import { cva, type VariantProps } from 'class-variance-authority'
import { mergeProps, splitProps, type ComponentProps } from 'solid-js'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

const buttonGroupVariants = cva(
  "grid grid-flow-col w-fit items-stretch *:focus-visible:relative *:focus-visible:z-10 has-data-[slot=button-group]:gap-2 has-[select[aria-hidden=true]:last-child]:[&_[data-slot=select-trigger]:last-of-type]:rounded-r-md [&_[data-slot=select-trigger]:not([class*='w-'])]:w-fit [&_input]:auto-cols-fr",
  {
    variants: {
      orientation: {
        horizontal:
          '*:data-slot:rounded-r-none [&_[data-slot]:not(:has(~[data-slot]))]:rounded-r-md! [&_[data-slot]~[data-slot]]:rounded-l-none [&_[data-slot]~[data-slot]]:border-l-0',
        vertical:
          'flex-col *:data-slot:rounded-b-none [&_[data-slot]:not(:has(~[data-slot]))]:rounded-b-md! [&_[data-slot]~[data-slot]]:rounded-t-none [&_[data-slot]~[data-slot]]:border-t-0',
      },
    },
    defaultVariants: {
      orientation: 'horizontal',
    },
  },
)

function ButtonGroup(props: ComponentProps<'div'> & VariantProps<typeof buttonGroupVariants>) {
  const [local, rest] = splitProps(props, ['class', 'orientation'])
  return (
    <div
      role="group"
      data-slot="button-group"
      data-orientation={local.orientation}
      class={cn(buttonGroupVariants({ orientation: local.orientation }), local.class)}
      {...rest}
    />
  )
}

function ButtonGroupWrapper(props: ComponentProps<'div'>) {
  const [local, rest] = splitProps(props, ['class'])
  return <div class={cn('flex flex-col justify-center items-center gap-0', local.class)} {...rest} />
}

function ButtonGroupText(props: useRender.ComponentProps<'div'>) {
  const [local, rest] = splitProps(props, ['class', 'render'])
  const element = useRender({
    props: mergeBaseUiProps<'div'>(
      {
        ['data-slot' as string]: 'button-group-text',
        get class() {
          return cn(
            "flex items-center gap-2 rounded-md text-xs/relaxed tracking-wide font-normal [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 row-2 justify-center mt-1",
            local.class,
          )
        },
      },
      rest,
    ),
    render: local.render ?? 'div',
    state: {
      slot: 'button-group-text',
    },
  })

  return <>{element()}</>
}

function ButtonGroupSeparator(props: ComponentProps<typeof Separator>) {
  const mergedProps = mergeProps({ orientation: 'vertical' as const }, props)
  const [local, rest] = splitProps(mergedProps, ['class', 'orientation'])
  return (
    <Separator
      data-slot="button-group-separator"
      orientation={local.orientation}
      class={cn(
        'relative self-stretch bg-input data-horizontal:mx-px data-horizontal:w-auto data-vertical:my-px data-vertical:h-auto',
        local.class,
      )}
      {...rest}
    />
  )
}

export { ButtonGroup, ButtonGroupWrapper, ButtonGroupSeparator, ButtonGroupText, buttonGroupVariants }
