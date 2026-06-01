import { cn, defaultProps } from '@/lib/utils'
import { useQuery } from 'convex-solidjs'
import { differenceInCalendarDays, formatDate } from 'date-fns'
import { createMemo, Match, Show, splitProps, Switch, type ComponentProps } from 'solid-js'
import { api } from '../../../convex/_generated/api'
import type { Doc } from '../../../convex/_generated/dataModel'
import { Avatar, AvatarBadgeOnline, AvatarFallback, AvatarImage } from '../ui/avatar'

interface VariantProps {
  variant?: 'default' | 'chat'
}

export function UserCard(componentProps: ComponentProps<'div'> & VariantProps & { user: Doc<'users'> }) {
  const props = defaultProps(componentProps, { variant: 'default' })
  const [local, rest] = splitProps(props, ['class', 'user', 'variant'])
  const { data: chat } = useQuery(api.chats.byUserId, { userId: local.user._id })
  return (
    <div
      class={cn(
        'flex gap-2 items-center p-2 overflow-hidden',
        local.variant === 'default' &&
          'hover:bg-tint-card/10 data-pressed:bg-blue-200/10 cursor-pointer transition-colors duration-50 ease-out',
        local.class,
      )}
      {...rest}
    >
      <Avatar user={local.user}>
        <AvatarImage />
        <AvatarFallback />
        <AvatarBadgeOnline />
      </Avatar>
      <Show when={chat()}>
        {(chatResolved) => <UsernameAndLastActivity variant={local.variant} user={local.user} chat={chatResolved()} />}
      </Show>
    </div>
  )
}

function UsernameAndLastActivity(props: { chat: Doc<'chats'>; user: Doc<'users'> } & VariantProps) {
  const { data: currentUser } = useQuery(api.users.current, {})
  const { data: lastMessage } = useQuery(api.chats.lastMessage, { chatId: props.chat._id })
  const { data: isTyping } = useQuery(api.chats.isTyping, { chatId: props.chat._id, userId: props.user._id })
  const { data: isOnline } = useQuery(
    api.users.isOnline,
    { userId: props.user._id },
    { enabled: props.variant === 'chat' },
  )
  const { data: sender } = useQuery(
    api.users.byId,
    () => ({ userId: lastMessage()?.userId as any }),
    () => ({ enabled: lastMessage() != null }),
  )

  function Username() {
    return <span>{props.user.fullname}</span>
  }

  function Timestamp() {
    const timestamp = createMemo(() => {
      const msg = lastMessage()
      if (!msg) return null
      const days = differenceInCalendarDays(new Date(), msg._creationTime)
      return formatDate(msg._creationTime, days === 0 ? 'HH:mm' : days < 7 ? 'EEE' : 'dd.MM.YYYY')
    })
    return (
      <Show when={lastMessage()}>
        <span class="text-muted justify-self-end">{timestamp()}</span>
      </Show>
    )
  }

  function IsTyping() {
    return (
      <span class="font-bold flex w-full h-full text-blue-400 overflow-hidden after:top-0 after:left-0 after:absolute relative duration-3000 after:animate-typing after:w-full after:h-full" />
    )
  }

  function NoMessages() {
    return <p class="text-tint-muted/10 truncate italic">This converstaion has no messages yet.</p>
  }

  function LastMessage() {
    return (
      <Show when={lastMessage()}>
        <Show when={sender()?._id === currentUser()?._id}>
          <span class="text-blue-300">You:</span>
        </Show>
        <p class="text-tint-muted/30 truncate">{lastMessage()!.body}</p>
      </Show>
    )
  }

  return (
    <div class="font-light grid grid-cols-2 grid-rows-2 items-center w-full">
      <Username />
      {props.variant === 'default' && <Timestamp />}

      <div class="flex items-center gap-1 text-xs overflow-hidden col-span-2 select-none h-full">
        <Switch>
          <Match when={props.variant === 'chat'}>
            {isOnline() ? <span class="text-blue-400">Online</span> : <span class="text-muted">Offline</span>}
          </Match>
          <Match when={props.variant === 'default'}>
            <Show when={isTyping() !== true} fallback={<IsTyping />}>
              {lastMessage() ? <LastMessage /> : <NoMessages />}
            </Show>
          </Match>
        </Switch>
      </div>
    </div>
  )
}
