import type { Doc } from '@/convex/dataModel'
import { useCurrentUser } from '@/lib/integrations/convex-clerk'
import { cn } from '@/lib/utils'
import { ArrowDownLeftIcon, ArrowUpRightIcon, PhoneIcon, PhoneMissedIcon } from 'lucide-solid'
import { createMemo, Match, Show, Switch } from 'solid-js'

type MessageType = 'chat' | 'last-message'
type CallType = 'incoming' | 'outgoing'

export function ChatMessage(props: { type: MessageType; message: Doc<'chat_messages'> }) {
  const currentUser = useCurrentUser()
  const whos = createMemo(() => (props.message.userId === currentUser()?._id ? 'mine' : 'their'))

  return (
    <Show
      when={props.type === 'chat'}
      fallback={
        <div class="flex items-center gap-1">
          <Show when={whos() === 'mine'}>
            <span class="text-blue-300">You:</span>
          </Show>
          <Show when={props.message.type === 'system'}>
            <CallArrow type={props.type} callType={whos() === 'mine' ? 'outgoing' : 'incoming'} />
          </Show>

          <p class={cn('text-tint-muted/30 truncate', props.message.type === 'system' && 'italic')}>
            {props.message.type === 'dm'
              ? props.message.body
              : props.message.body.status === 'declined'
                ? 'Call declined'
                : props.message.body.status === 'ended'
                  ? 'Call ended'
                  : ''}
          </p>
        </div>
      }
    >
      <div
        class={cn(
          'max-w-[80%] p-1.5 px-3 rounded-base text-white animate-in wrap-break-word [word-break:break-word] font-light',
          whos() === 'mine' && 'bg-sky-800 justify-self-end',
          whos() === 'their' && 'bg-slate-700 justify-self-start',
        )}
      >
        <Switch fallback={<span>{(props.message as MessageDM).body}</span>}>
          <Match when={props.message.type === 'system' && props.message}>
            {(msg) => (
              <Switch>
                <Match when={msg().body.status === 'ended'}>
                  <CallEnded {...(msg().body as MessageBodySystemCallEnded)} />
                </Match>
                <Match when={msg().body.status === 'declined'}>
                  <CallDeclined {...(msg().body as MessageBodySystemCallDeclined)} />
                </Match>
              </Switch>
            )}
          </Match>
        </Switch>
      </div>
    </Show>
  )
}

function CallEnded(props: MessageBodySystemCallEnded) {
  return (
    <p>
      <span class="flex gap-2 items-center">
        <PhoneIcon class="size-3.5" /> Call ended
      </span>
      <span class="flex justify-end text-xs text-foreground/60 font-extralight tracking-tight">{props.duration}</span>
    </p>
  )
}

function CallDeclined(_props: MessageBodySystemCallDeclined) {
  return (
    <p>
      <span class="flex gap-2 items-center">
        <PhoneMissedIcon class="size-3.5" /> Call declined
      </span>
    </p>
  )
}

function CallArrow(props: { type: MessageType; callType: CallType }) {
  return (
    <div class={cn('size-3', props.type === 'chat')}>
      <Show when={props.callType === 'outgoing'} fallback={<ArrowDownLeftIcon class="size-3 text-destructive" />}>
        <ArrowUpRightIcon class="size-full text-secondary" />
      </Show>
    </div>
  )
}
