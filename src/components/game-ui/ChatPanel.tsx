import { cn } from '@/lib/utils'
import { debounce, throttle } from '@solid-primitives/scheduled'
import { useMutation, useQuery } from 'convex-solidjs'
import { PhoneIcon } from 'lucide-solid'
import { createEffect, createSignal, createUniqueId, For, on, Show } from 'solid-js'
import { api } from '../../../convex/_generated/api'
import type { Doc, Id } from '../../../convex/_generated/dataModel'
import { useFloatingContext } from './FloatingPanel'
import { useGlobalState } from '../GlobalStateContext'
import { Card, CardAction, CardCloseAction, CardContent, CardFooter, CardHeader } from '../ui/card'
import { Textarea } from '../ui/textarea'
import { Toggle } from '../ui/toggle'
import { UserCard } from './UserCard'

export function ChatPanel(props: ChatPanel.Props) {
  const { data: chat } = useQuery(api.chats.byId, { chatId: props.chatId })
  return <Show when={chat()}>{(chatResolved) => <ChatPanelContent {...chatResolved()} />}</Show>
}

function ChatPanelContent(props: Doc<'chats'>) {
  const floatingContext = useFloatingContext(true)
  const { data: user } = useQuery(api.users.byChatId, { chatId: props._id })
  const { openFloatingPanel, isFloatingPanelOpen } = useGlobalState()
  return (
    <Card class="w-[calc(100vw-1rem)] max-w-100">
      <CardHeader class="border-b-2 border-input/50 py-0 flex justify-between items-center pl-1">
        <Show when={user()}>{(u) => <UserCard variant="chat" user={u()} />}</Show>
        <div class="flex items-center self-center gap-2">
          <CardAction>
            <Toggle
              variant="outline"
              size="icon-xs"
              class="v-secondary"
              pressed={isFloatingPanelOpen({ chatId: props._id, type: 'rtc' })}
              disabled={isFloatingPanelOpen({ chatId: props._id, type: 'rtc' })}
              onClick={({ target }) => {
                openFloatingPanel({ type: 'rtc', target, chatId: props._id })
              }}
            >
              <PhoneIcon />
            </Toggle>
          </CardAction>
          <CardCloseAction onClick={floatingContext.closePanel} />
        </div>
      </CardHeader>

      <ChatMessages {...props} />

      <CardFooter class="p-2">
        <ChatTextarea {...props} />
      </CardFooter>
    </Card>
  )
}

function ChatMessages(props: Doc<'chats'>) {
  let ref!: HTMLDivElement
  let mounted = false
  const { data: currentUser } = useQuery(api.users.current, {})
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
        <For each={messages()}>
          {(message) => (
            <div
              class={cn(
                'w-max p-1.5 px-2.5 rounded-xl text-white animate-in',
                message.userId === currentUser()?._id
                  ? 'bg-blue-500 justify-self-end'
                  : 'bg-indigo-500 justify-self-start',
              )}
            >
              <span>{message.body}</span>
            </div>
          )}
        </For>
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
  export interface Props {
    chatId: Id<'chats'>
  }
}
