import { api } from '@/convex/api'
import type { Doc } from '@/convex/dataModel'
import { useCurrentUser } from '@/lib/integrations/convex-clerk'
import { cn } from '@/lib/utils'
import { useQuery } from 'convex-solidjs'
import { formatDate, isToday } from 'date-fns'
import { ArrowDownLeftIcon, ArrowUpRightIcon, PhoneIcon, PhoneMissedIcon } from 'lucide-solid'
import { createEffect, createMemo, For, on, Show, type ValidComponent } from 'solid-js'
import { Dynamic } from 'solid-js/web'
import { CardContent } from '../ui/card'

type MessageType = 'chat' | 'last-message'
type CallType = 'incoming' | 'outgoing'
type Whos = 'mine' | 'their'

const SYSTEM_MESSAGE: Record<MessageSystemCall['status'], ValidComponent> = {
  ended: () => (
    <p>
      <span class="flex gap-2 items-center">
        <PhoneIcon class="size-3.5" /> Call ended
      </span>
    </p>
  ),
  declined: () => (
    <p>
      <span class="flex gap-2 items-center">
        <PhoneMissedIcon class="size-3.5" /> Call declined
      </span>
    </p>
  ),
}

export function ChatMessages(props: Doc<'chats'>) {
  let ref!: HTMLDivElement
  let mounted = false
  const { data: messages } = useQuery(api.chats.messages, { chatId: props._id })

  createEffect(
    on(messages, (msgs) => {
      if (mounted === false && msgs && msgs.length > 0) {
        mounted = true
        queueMicrotask(() => (ref.scrollTop = ref.scrollHeight))
      }
    }),
  )

  return (
    <CardContent
      ref={(el) => (ref = el)}
      class={cn(
        'max-h-80 min-h-80 overflow-auto py-2',
        messages() &&
          messages()!.length === 0 &&
          'relative before:absolute before:h-full before:w-full before:top-0 before:left-0 before:flex before:items-center before:justify-center before:content-["This_conversation_is_empty."] before:text-muted before:italic before:text-sm before:font-thin',
      )}
    >
      <div
        class={cn(
          'grid auto-rows-auto min-h-full gap-0 *:[overflow-anchor:none]',

          // ALL messages
          '*:max-w-[80%] *:p-1.5 *:px-3 *:rounded-lg *:text-white *:animate-in *:wrap-break-word *:[word-break:break-word] *:font-light',

          // ALL messages' main element containing an actual message
          `*:*:after:content-(--date)
          *:*:after:text-xs
          *:*:after:text-white/50
          *:*:after:font-extralight
          *:*:after:block
          *:*:after:h-0
          *:*:after:text-right
          *:*:after:pb-3`,

          /* ––– MY MESSAGES ––– */

          // all messages in a group
          `*:data-[whos=mine]:bg-sky-800
          *:data-[whos=mine]:justify-self-end
          *:data-[whos=mine]:rounded-bl-xs
          *:data-[whos=mine]:rounded-br-none`,

          // every "next" message
          `[&_[data-whos=mine]+[data-whos=mine]]:rounded-l-xs
          [&_[data-whos=mine]+[data-whos=mine]]:rounded-r-none
          [&_[data-whos=mine]+[data-whos=mine]]:border-t
          [&_[data-whos=mine]+[data-whos=mine]]:border-sky-900`,

          // last message in a group
          '[&_[data-whos=mine]:not(:has(+[data-whos=mine]))]:rounded-b-lg',

          /* ––– THEIR MESSAGES ––– */

          // all messages in a group
          `*:data-[whos=their]:bg-slate-700
          *:data-[whos=their]:justify-self-start
          *:data-[whos=their]:rounded-br-xs
          *:data-[whos=their]:rounded-bl-none`,

          // every "next" message
          `[&_[data-whos=their]+[data-whos=their]]:rounded-r-xs
          [&_[data-whos=their]+[data-whos=their]]:rounded-l-none
          [&_[data-whos=their]+[data-whos=their]]:border-t
          [&_[data-whos=their]+[data-whos=their]]:border-slate-800`,

          // last message in a group
          '[&_[data-whos=their]:not(:has(+[data-whos=their]))]:rounded-b-lg',
        )}
      >
        <For each={messages()}>{(message) => <ChatMessage type="chat" message={message} />}</For>
        <div class="[overflow-anchor:auto]! h-px" />
      </div>
    </CardContent>
  )
}

export function ChatMessage(props: { type: MessageType; message: Doc<'chat_messages'> }) {
  const currentUser = useCurrentUser()
  const whos = createMemo<Whos>(() => (props.message.userId === currentUser()?._id ? 'mine' : 'their'))
  const timestamp = createMemo(() => {
    return isToday(props.message._creationTime)
      ? formatDate(props.message._creationTime, 'HH:mm')
      : formatDate(props.message._creationTime, 'MM/DD HH:mm')
  })

  return (
    <div
      data-whos={whos()}
      data-variant={props.type}
      data-type={props.message.type}
      class="group"
      style={
        props.type === 'chat'
          ? {
              '--date': `"${timestamp()}`,
              '--duration':
                props.message.type === 'system' && props.message.body.status === 'ended'
                  ? props.message.body.duration
                  : undefined,
            }
          : undefined
      }
    >
      <div
        class={cn(
          `group-data-[variant=last-message]:flex
          group-data-[variant=last-message]:items-center
          group-data-[variant=last-message]:gap-1`,
        )}
      >
        <Show
          when={props.type === 'chat'}
          fallback={<LastMessage whos={whos()} type={props.type} message={props.message} />}
        >
          <Show
            when={props.message.type === 'system' && props.message.body.status}
            fallback={(props.message as MessageDM).body}
          >
            {(status) => <Dynamic component={SYSTEM_MESSAGE[status()]} />}
          </Show>
        </Show>
      </div>
    </div>
  )
}

function LastMessage(props: { whos: Whos; type: MessageType; message: Doc<'chat_messages'> }) {
  return (
    <>
      <Show when={props.whos === 'mine'}>
        <span class="text-blue-300">You:</span>
      </Show>

      <Show when={props.message.type === 'system'}>
        <CallArrow type={props.type} callType={props.whos === 'mine' ? 'outgoing' : 'incoming'} />
      </Show>

      <p data-type={props.message.type} class="text-tint-muted/30 truncate data-[type=system]:italic">
        {props.message.type === 'dm'
          ? props.message.body
          : props.message.body.status === 'declined'
            ? 'Call declined'
            : props.message.body.status === 'ended'
              ? 'Call ended'
              : ''}
      </p>
    </>
  )
}

function CallArrow(props: { type: MessageType; callType: CallType }) {
  return (
    <div class="size-3">
      <Show when={props.callType === 'outgoing'} fallback={<ArrowDownLeftIcon class="size-3 text-destructive" />}>
        <ArrowUpRightIcon class="size-full text-secondary" />
      </Show>
    </div>
  )
}
