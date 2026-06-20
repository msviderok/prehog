import type { Menu as MenuPrimitiveType } from '@msviderok/base-ui-solid/menu'
import { cn, defaultProps } from '@/lib/utils'
import { CheckIcon, ChevronRightIcon } from 'lucide-solid'
import { mergeProps, splitProps, type ComponentProps } from 'solid-js'
import { isServer } from 'solid-js/web'
import { Button, type ExtraButtonProps } from './button'

const MenuPrimitive = isServer
  ? ({} as typeof import('@msviderok/base-ui-solid/menu').Menu)
  : (await import('@msviderok/base-ui-solid/menu')).Menu

function DropdownMenu(props: MenuPrimitiveType.Root.Props) {
  return <MenuPrimitive.Root data-slot="dropdown-menu" {...props} />
}

function DropdownMenuPortal(props: MenuPrimitiveType.Portal.Props) {
  return <MenuPrimitive.Portal data-slot="dropdown-menu-portal" {...props} />
}

function DropdownMenuTrigger(componentProps: MenuPrimitiveType.Trigger.Props & ExtraButtonProps) {
  const props = defaultProps(componentProps, { variant: 'default', size: 'default' })
  const [buttonProps, rest] = splitProps(props, ['class', 'variant', 'size'])
  const restPropsWithRender = defaultProps(rest, { render: (p) => <Button {...p} {...buttonProps} /> })
  return <MenuPrimitive.Trigger data-slot="dropdown-menu-trigger" {...restPropsWithRender} />
}

function DropdownMenuContent(
  props: MenuPrimitiveType.Popup.Props &
    Pick<MenuPrimitiveType.Positioner.Props, 'align' | 'alignOffset' | 'side' | 'sideOffset'>,
) {
  const mergedProps = mergeProps(
    {
      align: 'start' as const,
      alignOffset: 0,
      side: 'bottom' as const,
      sideOffset: 4,
    },
    props,
  )
  const [local, rest] = splitProps(mergedProps, ['align', 'alignOffset', 'side', 'sideOffset', 'class'])
  return (
    <MenuPrimitive.Portal>
      <MenuPrimitive.Positioner
        class="isolate z-1000 outline-none"
        align={local.align}
        alignOffset={local.alignOffset}
        side={local.side}
        sideOffset={local.sideOffset}
        positionMethod="fixed"
      >
        <MenuPrimitive.Popup
          data-slot="dropdown-menu-content"
          class={cn(
            'z-50 max-h-(--available-height) w-(--anchor-width) min-w-32 origin-(--transform-origin) overflow-x-hidden overflow-y-auto rounded-lg bg-popover p-1 text-popover-foreground shadow-md ring-1 ring-foreground/10 duration-100 outline-none data-[side=bottom]:slide-in-from-top-2 data-[side=inline-end]:slide-in-from-left-2 data-[side=inline-start]:slide-in-from-right-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:overflow-hidden data-closed:fade-out-0 data-closed:zoom-out-95',
            local.class,
          )}
          {...rest}
        />
      </MenuPrimitive.Positioner>
    </MenuPrimitive.Portal>
  )
}

function DropdownMenuGroup(props: MenuPrimitiveType.Group.Props) {
  return <MenuPrimitive.Group data-slot="dropdown-menu-group" {...props} />
}

function DropdownMenuLabel(
  props: MenuPrimitiveType.GroupLabel.Props & {
    inset?: boolean
  },
) {
  const [local, rest] = splitProps(props, ['class', 'inset'])
  return (
    <MenuPrimitive.GroupLabel
      data-slot="dropdown-menu-label"
      data-inset={local.inset}
      class={cn('flex items-center gap-2 px-2 py-1.5 text-xs text-muted-foreground data-inset:pl-7.5', local.class)}
      {...rest}
    />
  )
}

function DropdownMenuItem(
  props: MenuPrimitiveType.Item.Props & {
    inset?: boolean
    variant?: 'default' | 'destructive'
  },
) {
  const mergedProps = mergeProps({ variant: 'default' as const }, props)
  const [local, rest] = splitProps(mergedProps, ['class', 'inset', 'variant'])
  return (
    <MenuPrimitive.Item
      data-slot="dropdown-menu-item"
      data-inset={local.inset}
      data-variant={local.variant}
      class={cn(
        "group/dropdown-menu-item relative flex min-h-7 cursor-default items-center gap-2 rounded-md px-2 py-1 text-xs/relaxed outline-hidden select-none focus:bg-accent focus:text-accent-foreground not-data-[variant=destructive]:focus:**:text-accent-foreground data-inset:pl-7.5 data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 data-[variant=destructive]:focus:text-destructive dark:data-[variant=destructive]:focus:bg-destructive/20 data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.5 data-[variant=destructive]:*:[svg]:text-destructive",
        local.class,
      )}
      {...rest}
    />
  )
}

function DropdownMenuSub(props: MenuPrimitiveType.SubmenuRoot.Props) {
  return <MenuPrimitive.SubmenuRoot data-slot="dropdown-menu-sub" {...props} />
}

function DropdownMenuSubTrigger(
  props: MenuPrimitiveType.SubmenuTrigger.Props & {
    inset?: boolean
  },
) {
  const [local, rest] = splitProps(props, ['class', 'inset', 'children'])
  return (
    <MenuPrimitive.SubmenuTrigger
      data-slot="dropdown-menu-sub-trigger"
      data-inset={local.inset}
      class={cn(
        "flex min-h-7 cursor-default items-center gap-2 rounded-md px-2 py-1 text-xs outline-hidden select-none focus:bg-accent focus:text-accent-foreground not-data-[variant=destructive]:focus:**:text-accent-foreground data-inset:pl-7.5 data-popup-open:bg-accent data-popup-open:text-accent-foreground data-open:bg-accent data-open:text-accent-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.5",
        local.class,
      )}
      {...rest}
    >
      {local.children}
      <ChevronRightIcon class="ml-auto" />
    </MenuPrimitive.SubmenuTrigger>
  )
}

function DropdownMenuSubContent(props: ComponentProps<typeof DropdownMenuContent>) {
  const mergedProps = mergeProps(
    {
      align: 'start' as const,
      alignOffset: -3,
      side: 'right' as const,
      sideOffset: 0,
    },
    props,
  )
  const [local, rest] = splitProps(mergedProps, ['align', 'alignOffset', 'side', 'sideOffset', 'class'])
  return (
    <DropdownMenuContent
      data-slot="dropdown-menu-sub-content"
      class={cn(
        'w-auto min-w-32 rounded-lg bg-popover p-1 text-popover-foreground shadow-md ring-1 ring-foreground/10 duration-100 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95',
        local.class,
      )}
      align={local.align}
      alignOffset={local.alignOffset}
      side={local.side}
      sideOffset={local.sideOffset}
      {...rest}
    />
  )
}

function DropdownMenuCheckboxItem(
  props: MenuPrimitiveType.CheckboxItem.Props & {
    inset?: boolean
  },
) {
  const [local, rest] = splitProps(props, ['class', 'children', 'checked', 'inset'])
  return (
    <MenuPrimitive.CheckboxItem
      data-slot="dropdown-menu-checkbox-item"
      data-inset={local.inset}
      class={cn(
        "relative flex min-h-7 cursor-default items-center gap-2 rounded-md py-1.5 pr-8 pl-2 text-xs outline-hidden select-none focus:bg-accent focus:text-accent-foreground focus:**:text-accent-foreground data-inset:pl-7.5 data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.5",
        local.class,
      )}
      checked={local.checked}
      {...rest}
    >
      <span
        class="pointer-events-none absolute right-2 flex items-center justify-center"
        data-slot="dropdown-menu-checkbox-item-indicator"
      >
        <MenuPrimitive.CheckboxItemIndicator>
          <CheckIcon />
        </MenuPrimitive.CheckboxItemIndicator>
      </span>
      {local.children}
    </MenuPrimitive.CheckboxItem>
  )
}

function DropdownMenuRadioGroup(props: MenuPrimitiveType.RadioGroup.Props) {
  return <MenuPrimitive.RadioGroup data-slot="dropdown-menu-radio-group" {...props} />
}

function DropdownMenuRadioItem(
  props: MenuPrimitiveType.RadioItem.Props & {
    inset?: boolean
  },
) {
  const [local, rest] = splitProps(props, ['class', 'children', 'inset'])
  return (
    <MenuPrimitive.RadioItem
      data-slot="dropdown-menu-radio-item"
      data-inset={local.inset}
      class={cn(
        "relative flex min-h-7 cursor-default items-center gap-2 rounded-md py-1.5 pr-8 pl-2 text-xs outline-hidden select-none focus:bg-accent focus:text-accent-foreground focus:**:text-accent-foreground data-inset:pl-7.5 data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.5",
        local.class,
      )}
      {...rest}
    >
      <span
        class="pointer-events-none absolute right-2 flex items-center justify-center"
        data-slot="dropdown-menu-radio-item-indicator"
      >
        <MenuPrimitive.RadioItemIndicator>
          <CheckIcon />
        </MenuPrimitive.RadioItemIndicator>
      </span>
      {local.children}
    </MenuPrimitive.RadioItem>
  )
}

function DropdownMenuSeparator(props: MenuPrimitiveType.Separator.Props) {
  const [local, rest] = splitProps(props, ['class'])
  return (
    <MenuPrimitive.Separator
      data-slot="dropdown-menu-separator"
      class={cn('-mx-1 my-1 h-px bg-muted/50', local.class)}
      {...rest}
    />
  )
}

function DropdownMenuShortcut(props: ComponentProps<'span'>) {
  const [local, rest] = splitProps(props, ['class'])
  return (
    <span
      data-slot="dropdown-menu-shortcut"
      class={cn(
        'ml-auto text-[0.625rem] tracking-widest text-muted-foreground group-focus/dropdown-menu-item:text-accent-foreground',
        local.class,
      )}
      {...rest}
    />
  )
}

export {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
}
