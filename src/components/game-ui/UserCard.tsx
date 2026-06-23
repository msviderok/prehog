import { cn, defaultProps } from '@/lib/utils'
import { useQuery } from 'convex-solidjs'
import { differenceInCalendarDays, formatDate } from 'date-fns'
import { createMemo, Match, Show, splitProps, Switch, type ComponentProps } from 'solid-js'
import { api } from '@/convex/api'
import type { Doc } from '@/convex/dataModel'
import { Avatar, AvatarBadgeOnline, AvatarFallback, AvatarImage } from '../ui/avatar'
import { Skeleton } from '../ui/skeleton'
import { useCurrentUser } from '@/lib/integrations/convex-clerk'
import { ChatMessage } from './ChatMessage'

interface VariantProps {
  variant?: 'default' | 'chat'
}

export function UserCard(
  componentProps: ComponentProps<'div'> & VariantProps & { user: Doc<'users'>; isLoading?: boolean },
) {
  const props = defaultProps(componentProps, { variant: 'default' })
  const [local, rest] = splitProps(props, ['class', 'user', 'variant', 'isLoading'])
  const { data: chat } = useQuery(api.chats.findByUserId, { userId: local.user._id })
  return (
    <div
      class={cn(
        'flex gap-3 items-center p-2 overflow-hidden relative border-b border-muted/30',
        local.variant === 'default' &&
          'hover:bg-tint-card/10 data-pressed:bg-blue-200/10 cursor-pointer transition-colors duration-50 ease-out',
        local.class,
      )}
      {...rest}
    >
      <Avatar user={local.user} isLoading={local.isLoading}>
        <AvatarImage />
        <AvatarFallback />
        <AvatarBadgeOnline />
      </Avatar>

      <div class="font-light grid grid-cols-2 grid-rows-2 items-center w-full">
        <span class={cn(!chat() && 'row-span-full text-sm')}>{props.user.fullname}</span>
        <Show when={chat()}>
          {(chatResolved) => <LastActivity variant={local.variant} user={local.user} chat={chatResolved()} />}
        </Show>
      </div>

      <Show when={local.variant === 'default' && local.isLoading}>
        <Skeleton
          variant="overlay"
          class="w-full h-full absolute top-0 left-0 z-10"
          style={{ 'animation-delay': '500ms' }}
        />
      </Show>
    </div>
  )
}

function LastActivity(props: { chat: Doc<'chats'>; user: Doc<'users'> } & VariantProps) {
  const currentUser = useCurrentUser()
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
    return <span class="font-bold h-full text-blue-400 typing">Typing</span>
  }

  function NoMessages() {
    return <p class="text-tint-muted/10 truncate italic">This converstaion has no messages yet.</p>
  }

  function LastMessage() {
    return (
      <Show when={lastMessage()}>
        <ChatMessage type="last-message" message={lastMessage()!} />
      </Show>
    )
  }

  return (
    <>
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
    </>
  )
}
