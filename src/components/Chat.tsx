import { cn } from '@/lib/utils'
import { debounce, throttle } from '@solid-primitives/scheduled'
import { useMutation, useQuery } from 'convex-solidjs'
import type { FunctionReturnType } from 'convex/server'
import { GripVerticalIcon, LoaderCircle, PhoneIcon, SendHorizontal, XIcon } from 'lucide-solid'
import { createEffect, createMemo, createSignal, For, on, Show } from 'solid-js'
import { produce } from 'solid-js/store'
import { Portal } from 'solid-js/web'
import { api } from '../../convex/_generated/api'
import type { Id } from '../../convex/_generated/dataModel'
import { useGlobalState } from './GlobalStateContext'
import { Avatar } from './ui/avatar'
import { Button } from './ui/button'
import { Card, CardAction, CardContent, CardFooter, CardHeader } from './ui/card'
import { Textarea } from './ui/textarea'
import { Toggle } from './ui/toggle'

export function Chat(props: { userId: Id<'users'> }) {
  const id = `chat-${props.userId}`
  const { floatingPanels, setFloatingPanels } = useGlobalState()

  const chat = useQuery(api.chats.byUserId, { userId: props.userId })
  const initChat = useMutation(api.chats.initChat)
  const isLoadingChat = createMemo(() => chat.isLoading() || initChat.isLoading())

  return (
    <>
      <Toggle
        size="icon"
        disabled={isLoadingChat()}
        onPressedChange={(pressed, e) => {
          if (pressed) {
            const rect = (e.target as HTMLButtonElement).getBoundingClientRect()
            setFloatingPanels(
              'panels',
              produce((state) => {
                state[id] = { x: rect.left, y: rect.top }
              }),
            )

            void initChat.mutate({ contactId: props.userId })
          }
        }}
      >
        {isLoadingChat() ? <LoaderCircle /> : <SendHorizontal />}
      </Toggle>

      <Show when={floatingPanels.panels[id] != null && chat.data()}>
        {(chatData) => (
          <ChatCard
            id={id}
            chat={chatData()}
            onClose={() =>
              setFloatingPanels(
                'panels',
                produce((state) => {
                  delete state[id]
                }),
              )
            }
          />
        )}
      </Show>
    </>
  )
}

function ChatCard(props: { id: string; onClose: () => void; chat: FunctionReturnType<typeof api.chats.byUserId> }) {
  let cardRef: HTMLElement | undefined
  const { floatingPanels } = useGlobalState()

  createEffect(() => {
    if (cardRef) {
      cardRef.style.transform = `translate(${floatingPanels.panels[props.id].x ?? 0}px, ${floatingPanels.panels[props.id].y ?? 0}px)`
    }
  })

  return (
    <Portal mount={floatingPanels.containerRef}>
      <Card id={props.id} floating ref={(el) => (cardRef = el)} class="w-80">
        <CardHeader class="border-b-2 border-input/50 py-1.5 flex justify-between items-center">
          <div class="flex gap-2.5 items-center">
            <Avatar user={props.chat.contact} />
            <div class="flex flex-col gap-0">
              <span>{props.chat.contact.fullname}</span>
              <span class={cn('text-muted leading-tight text-xs', props.chat.contact.isOnline && 'text-blue-400')}>
                {props.chat.contactMember.itTyping ? 'Typing...' : props.chat.contact.isOnline ? 'Online' : 'Offline'}
              </span>
            </div>
          </div>

          <div class="flex items-center self-center gap-2">
            <CardAction>
              <Toggle variant="outline" size="sm" class="v-secondary">
                <PhoneIcon />
              </Toggle>
            </CardAction>
            <CardAction>
              <Button variant="plain" size="sm" onClick={props.onClose}>
                <XIcon />
              </Button>
            </CardAction>
          </div>
        </CardHeader>

        <ChatMessages chat={props.chat} />

        <CardFooter class="p-0">
          <ChatTextarea id={props.id} chat={props.chat} />
        </CardFooter>
      </Card>
    </Portal>
  )
}

function ChatMessages(props: { chat: FunctionReturnType<typeof api.chats.byUserId> }) {
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
    <CardContent ref={(el) => (ref = el)} class="max-h-80 overflow-auto">
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

function ChatTextarea(props: { id: string; chat: FunctionReturnType<typeof api.chats.byUserId> }) {
  const [text, setText] = createSignal('')
  const sendMessage = useMutation(api.chats.sendMessage)
  const signalMeTyping = useMutation(api.chats.signalTyping)

  const signalTypingStart = throttle(() => {
    signalMeTyping.mutate({ isTyping: true, memberId: props.chat.myMember._id })
  }, 500)
  const signalTypingEnd = debounce(() => {
    signalMeTyping.mutate({ isTyping: false, memberId: props.chat.myMember._id })
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
          setText('')
        }
      }}
    />
  )
}
