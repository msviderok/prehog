import { api } from '@/convex/api'
import type { Doc } from '@/convex/dataModel'
import { cn } from '@/lib/utils'
import { Avatar as AvatarPrimitive } from '@msviderok/base-ui-solid/avatar'
import { ClientOnly } from '@tanstack/solid-router'
import { cva, type VariantProps } from 'class-variance-authority'
import { useQuery } from 'convex-solidjs'
import { createContext, createEffect, createMemo, splitProps, useContext, type ComponentProps } from 'solid-js'

const avatarVariants = cva('group/avatar relative flex shrink-0 rounded-full outline items-center select-none', {
  variants: {
    variant: {
      default: '-top-0.5 size-7',
      'on-call': 'size-26',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
})

const AvatarContext = createContext<{ user: Doc<'users'> | undefined }>({ user: undefined })

function Avatar(
  props: AvatarPrimitive.Root.Props &
    VariantProps<typeof avatarVariants> & { user?: Doc<'users'>; isLoading?: boolean },
) {
  const [local, rest] = splitProps(props, ['class', 'user', 'variant', 'isLoading'])
  return (
    <ClientOnly>
      <AvatarContext.Provider
        value={{
          get user() {
            return local.user
          },
        }}
      >
        <AvatarPrimitive.Root
          data-slot="avatar"
          data-loading={local.isLoading}
          data-variant={local.variant}
          class={avatarVariants({ variant: local.variant, class: local.class })}
          {...rest}
        >
          {props.children}
        </AvatarPrimitive.Root>
      </AvatarContext.Provider>
    </ClientOnly>
  )
}

function AvatarImage(props: AvatarPrimitive.Image.Props) {
  const [local, rest] = splitProps(props, ['class', 'src'])
  const context = useContext(AvatarContext)
  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      class={cn('aspect-square size-full rounded-full object-cover', local.class)}
      src={local.src ?? context?.user?.avatar}
      {...rest}
    />
  )
}

function AvatarFallback(props: AvatarPrimitive.Fallback.Props & { fullName?: string | null }) {
  const [local, rest] = splitProps(props, ['class', 'children', 'fullName'])
  const context = useContext(AvatarContext)
  const getUserFallback = createMemo(() => {
    const fullName = props.fullName ?? context.user?.fullname
    if (fullName == null) return ''
    const [firstname = '', lastname = ''] = fullName.split(' ')
    return `${firstname[0]}${lastname[0]}`
  })

  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      class={cn(
        'flex size-full items-center justify-center rounded-full bg-muted text-xs text-muted-foreground group-data-[variant=on-call]/avatar:text-5xl',
        local.class,
      )}
      {...rest}
    >
      {props.children ?? getUserFallback()}
    </AvatarPrimitive.Fallback>
  )
}

function AvatarBadge(props: ComponentProps<'span'>) {
  const [local, rest] = splitProps(props, ['class'])
  return (
    <span
      data-slot="avatar-badge"
      class={cn(
        'absolute right-0 bottom-0 z-10 inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground bg-blend-color ring-2 ring-background select-none size-2 [&>svg]:hidden group-data-[loading=true]/avatar:animate-bounce delay-1500',
        local.class,
      )}
      {...rest}
    />
  )
}

function AvatarBadgeOnline(props: ComponentProps<'span'> & { isOnline?: boolean; inline?: boolean }) {
  const [local, rest] = splitProps(props, ['class', 'isOnline', 'style', 'inline'])
  const context = useContext(AvatarContext)
  const { data: isOnline } = useQuery(
    api.users.isOnline,
    () => ({ userId: context.user?._id as any }),
    () => ({ enabled: context.user != null }),
  )
  return (
    <AvatarBadge
      data-online={isOnline() ?? local.isOnline}
      class={cn(
        'opacity-0 data-[online=true]:opacity-100 data-[online=true]:bg-blue-400 group-data-[loading=true]/avatar:animate-bounce',
        local.inline && 'relative -top-0.5',
        local.class,
      )}
      style={typeof local.style === 'string' ? local.style : { 'animation-delay': '500ms', 'transition-delay': '0ms' }}
      {...rest}
    />
  )
}

function AvatarGroup(props: ComponentProps<'div'>) {
  const [local, rest] = splitProps(props, ['class'])
  return (
    <div
      data-slot="avatar-group"
      class={cn(
        'group/avatar-group flex -space-x-2 *:data-[slot=avatar]:ring-2 *:data-[slot=avatar]:ring-background',
        local.class,
      )}
      {...rest}
    />
  )
}

function AvatarGroupCount(props: ComponentProps<'div'>) {
  const [local, rest] = splitProps(props, ['class'])
  return (
    <div
      data-slot="avatar-group-count"
      class={cn(
        'relative flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs/relaxed text-muted-foreground ring-2 ring-background group-has-data-[size=lg]/avatar-group:size-10 group-has-data-[size=sm]/avatar-group:size-6 [&>svg]:size-4 group-has-data-[size=lg]/avatar-group:[&>svg]:size-5 group-has-data-[size=sm]/avatar-group:[&>svg]:size-3',
        local.class,
      )}
      {...rest}
    />
  )
}

export { Avatar, AvatarBadge, AvatarBadgeOnline, AvatarFallback, AvatarGroup, AvatarGroupCount, AvatarImage }
