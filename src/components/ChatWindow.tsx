import { cn } from '@/lib/utils'
import { debounce, throttle } from '@solid-primitives/scheduled'
import { useMutation, useQuery } from 'convex-solidjs'
import type { FunctionReturnType } from 'convex/server'
import { createEffect, createSignal, For, on, Show } from 'solid-js'
import { api } from '../../convex/_generated/api'
import { AudioCall } from './AudioCall'
import { useGlobalState } from './GlobalStateContext'
import { Avatar, AvatarBadgeOnline, AvatarFallback, AvatarImage } from './ui/avatar'
import { Card, CardAction, CardCloseAction, CardContent, CardFooter, CardHeader } from './ui/card'
import { Textarea } from './ui/textarea'

type Chat = FunctionReturnType<typeof api.users.usersWithChat>[number]['chat']

export function ChatWindow(props: { id: string; chat: Chat }) {
  const { isFloatingPanelOpen, closeFloatingPanel } = useGlobalState()
  const { data: isTyping } = useQuery(api.chats.isTyping, { chatMemberId: props.chat.contactMember._id })
  const { data: isOnline } = useQuery(api.users.isOnline, { userId: props.chat.contact._id })

  return (
    <Show when={isFloatingPanelOpen(props.id)}>
      <Card floating id={props.id} class="w-80">
        <CardHeader class="border-b-2 border-input/50 py-1.5 flex justify-between items-center">
          <div class="flex gap-2.5 items-center">
            <Avatar user={props.chat.contact}>
              <AvatarImage />
              <AvatarFallback />
              <AvatarBadgeOnline isOnline={isOnline() ?? false} />
            </Avatar>
            <div class="flex flex-col gap-0">
              <span>{props.chat.contact.fullname}</span>
              <span class={cn('text-muted leading-tight text-xs', isOnline() && 'text-blue-400')}>
                {isTyping() ? 'Typing...' : isOnline() ? 'Online' : 'Offline'}
              </span>
            </div>
          </div>

          <div class="flex items-center self-center gap-2">
            <CardAction>
              <AudioCall chat={props.chat} />
            </CardAction>
            <CardCloseAction onClick={() => closeFloatingPanel(props.id)} />
          </div>
        </CardHeader>

        <ChatMessages chat={props.chat} />

        <CardFooter class="p-2">
          <ChatTextarea id={props.id} chat={props.chat} />
        </CardFooter>
      </Card>
    </Show>
  )
}

function ChatMessages(props: { chat: Chat }) {
  let ref!: HTMLDivElement
  let mounted = false
  const { data: messages } = useQuery(
    api.chats.messages,
    () => ({ chatId: props.chat.chat._id }),
    () => ({ enabled: props.chat.chat._id != null, initialData: [], keepPreviousData: true }),
  )

  function scrollToBottom() {
    ref.scrollTop = ref.scrollHeight
  }

  createEffect(
    on(messages, (msgs) => {
      if (mounted === false && msgs && msgs.length > 0) {
        mounted = true
        queueMicrotask(scrollToBottom)
      }
    }),
  )

  return (
    <CardContent ref={(el) => (ref = el)} class="max-h-80 overflow-auto py-2">
      <div class="grid auto-rows-auto min-h-full gap-0.5 *:[overflow-anchor:none]">
        <For each={messages()}>
          {(message) => (
            <div
              class={cn(
                'w-max p-1.5 px-2.5 rounded-xl text-white animate-in',
                message.chatMemberId === props.chat.myMember._id && 'bg-blue-400 justify-self-end',
                message.chatMemberId === props.chat.contactMember._id && 'bg-indigo-400 justify-self-start',
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

function ChatTextarea(props: { id: string; chat: Chat }) {
  const [text, setText] = createSignal('')
  const sendMessage = useMutation(api.chats.sendMessage)
  const setIsTyping = useMutation(api.chats.setIsTyping)

  const signalTypingStart = throttle(() => {
    setIsTyping.mutate({ isTyping: true, chatMemberId: props.chat.myMember._id })
  }, 500)
  const signalTypingEnd = debounce(() => {
    setIsTyping.mutate({ isTyping: false, chatMemberId: props.chat.myMember._id })
  }, 1000)

  return (
    <Textarea
      id={`textarea-${props.id}`}
      name="message"
      value={text()}
      onInput={(e) => setText(e.target.value)}
      placeholder="Write a message..."
      disabled={sendMessage.isLoading()}
      onKeyDown={async (e) => {
        signalTypingStart()
        signalTypingEnd()

        if (e.key === 'Enter' && !e.ctrlKey && !e.metaKey && !e.shiftKey && !e.altKey && text()) {
          await sendMessage.mutateAsync({
            chatId: props.chat.chat._id,
            chatMemberId: props.chat.myMember._id,
            body: text(),
          })
          await setIsTyping.mutate({ isTyping: false, chatMemberId: props.chat.myMember._id })
          setText('')
        }
      }}
    />
  )
}
