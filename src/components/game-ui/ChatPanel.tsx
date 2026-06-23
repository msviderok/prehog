import { api } from '@/convex/api'
import type { Doc } from '@/convex/dataModel'
import { cn, getNewPanelPosition } from '@/lib/utils'
import { debounce, throttle } from '@solid-primitives/scheduled'
import { useMutation, useQuery } from 'convex-solidjs'
import { PhoneIcon, PhoneMissedIcon } from 'lucide-solid'
import { createEffect, createMemo, createSignal, createUniqueId, For, Match, on, Show, Switch } from 'solid-js'
import { Card, CardAction, CardCloseAction, CardContent, CardFooter, CardHeader } from '../ui/card'
import { Textarea } from '../ui/textarea'
import { Toggle } from '../ui/toggle'
import { useFloatingContext } from './FloatingContext'
import { UserCard } from './UserCard'
import { useCurrentUser } from '@/lib/integrations/convex-clerk'
import { ChatMessage } from './ChatMessage'

export function ChatPanel(props: ChatPanel.Props) {
  const { data: chat } = useQuery(api.chats.byId, { chatId: props.chatId })
  const { data: user } = useQuery(
    api.users.byChatId,
    () => ({ chatId: chat()?._id as any }),
    () => ({ enabled: chat()?._id != null }),
  )
  const isLoaded = createMemo(() => !!(chat() && user()))
  return (
    <Show when={isLoaded()}>
      <ChatPanelContent chat={chat()!} user={user()!} />
    </Show>
  )
}

function ChatPanelContent(props: { chat: Doc<'chats'>; user: Doc<'users'> }) {
  const floatingContext = useFloatingContext(true)
  const currentUser = useCurrentUser()
  const currentCall = useQuery(api.activeCall.get, {})
  const initCall = useMutation(api.calls.initCall)

  const isOnCallWithUser = createMemo(() => {
    const call = currentCall.data()
    const me = currentUser()
    if (!call) return false

    const meCallingUser = call.fromUserId === me._id && call.toUserId === props.user._id
    const userCallingMe = call.fromUserId === props.user._id && call.toUserId === me._id
    return meCallingUser || userCallingMe
  })

  return (
    <Card variant="chat-panel">
      <CardHeader>
        <UserCard variant="chat" user={props.user} />
        <div class="flex items-center gap-2">
          <CardAction>
            <Toggle
              variant="outline"
              size="icon-xs"
              class="v-secondary"
              pressed={isOnCallWithUser()}
              disabled={isOnCallWithUser()}
              onClick={({ target }) => {
                initCall.mutate({ ...getNewPanelPosition(target), userId: props.user._id })
              }}
            >
              <PhoneIcon />
            </Toggle>
          </CardAction>
          <CardCloseAction onClick={floatingContext.closePanel} />
        </div>
      </CardHeader>

      <ChatMessages {...props.chat} />

      <CardFooter>
        <ChatTextarea {...props.chat} />
      </CardFooter>
    </Card>
  )
}

function ChatMessages(props: Doc<'chats'>) {
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
      <div class="grid auto-rows-auto min-h-full gap-0.5 *:[overflow-anchor:none]">
        <For each={messages()}>{(message) => <ChatMessage type="chat" message={message} />}</For>
        <div class="[overflow-anchor:auto]! h-px" />
      </div>
    </CardContent>
  )
}

function ChatTextarea(props: Doc<'chats'>) {
  const id = `textarea-${createUniqueId()}`
  const [text, setText] = createSignal('')
  const sendMessage = useMutation(api.chats.sendMessage)
  const setIsTyping = useMutation(api.chats.setIsTyping)
  const signalTypingStart = throttle(() => setIsTyping.mutate({ isTyping: true, chatId: props._id }), 500)
  const signalTypingEnd = debounce(() => setIsTyping.mutate({ isTyping: false, chatId: props._id }), 1000)
  return (
    <Textarea
      id={id}
      name="message"
      value={text()}
      onInput={(e) => setText(e.target.value)}
      placeholder="Write a message..."
      disabled={sendMessage.isLoading()}
      onKeyDown={async (e) => {
        signalTypingStart()
        signalTypingEnd()

        if (e.key === 'Enter' && !e.ctrlKey && !e.metaKey && !e.shiftKey && !e.altKey && text()) {
          void setIsTyping.mutate({ isTyping: false, chatId: props._id })
          await sendMessage.mutateAsync({ chatId: props._id, body: text() })
          setText('')
        }
      }}
    />
  )
}

export namespace ChatPanel {
  export type Props = PanelTypeChat
}
