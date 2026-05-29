import { cn } from '@/lib/utils'
import { useDraggable } from '@dnd-kit/solid'
import { debounce, throttle } from '@solid-primitives/scheduled'
import { useMutation, useQuery } from 'convex-solidjs'
import type { FunctionReturnType } from 'convex/server'
import { GripVerticalIcon, LoaderCircle, SendHorizontal } from 'lucide-solid'
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

export function ChatCard(props: { id: string; chat: FunctionReturnType<typeof api.chats.byUserId> }) {
  const [text, setText] = createSignal('')
  const { floatingPanels } = useGlobalState()
  const { ref, handleRef } = useDraggable({ id: props.id })

  const sendMessage = useMutation(api.chats.sendMessage)
  const signalMeTyping = useMutation(api.chats.signalTyping)

  const signalTypingStart = throttle(() => {
    signalMeTyping.mutate({ isTyping: true, memberId: props.chat.myMember._id })
  }, 500)
  const signalTypingEnd = debounce(() => {
    signalMeTyping.mutate({ isTyping: false, memberId: props.chat.myMember._id })
  }, 1000)

  const panelPosition = createMemo(() => floatingPanels.panels[props.id] ?? { x: 0, y: 0 })

  return (
    <Portal mount={floatingPanels.containerRef}>
      <Card
        ref={ref}
        style={{ transform: `translate(${panelPosition().x}px, ${panelPosition().y}px)` }}
        class={cn(
          'w-80 shadow-[0_0_5px_3px] shadow-transparent py-0! focus-within:border-tint-primary/10 focus-within:shadow-shade-primary/30 fixed top-0 left-0 z-1000',
        )}
      >
        <CardHeader ref={handleRef} class="border-b-2 border-input/50 py-1.5 flex justify-between items-center">
          <div class="flex gap-2.5 items-center">
            <Avatar user={props.chat.contact} />
            <div class="flex flex-col gap-0">
              <span>{props.chat.contact.fullname}</span>
              <span class={cn('text-muted leading-tight text-xs', props.chat.contact.isOnline && 'text-blue-400')}>
                {props.chat.contactMember.itTyping ? 'Typing...' : props.chat.contact.isOnline ? 'Online' : 'Offline'}
              </span>
            </div>
          </div>

          <CardAction class="self-center">
            <Button variant="plain" size="sm" class="v-transparent cursor-move">
              <GripVerticalIcon />
            </Button>
          </CardAction>
        </CardHeader>

        <MessagesContainer chat={props.chat} />

        <CardFooter class="p-0">
          <Textarea
            id={`textarea-${props.id}`}
            value={text()}
            onInput={(e) => setText(e.target.value)}
            placeholder="Write a message..."
            disabled={sendMessage.isLoading()}
            onKeyDown={async (e) => {
              signalTypingStart()
              signalTypingEnd()

              if (e.key === 'Enter') {
                await sendMessage.mutateAsync({
                  chatId: props.chat.chat._id,
                  chatMemberId: props.chat.myMember._id,
                  body: text(),
                })
                setText('')
              }
            }}
          />
        </CardFooter>
      </Card>
    </Portal>
  )
}

export function Chat(props: { userId: Id<'users'> }) {
  const id = `chat-${props.userId}`
  const [open, setOpen] = createSignal(false)
  const { floatingPanels, setFloatingPanels } = useGlobalState()

  const chat = useQuery(api.chats.byUserId, { userId: props.userId })
  const initChat = useMutation(api.chats.initChat)
  const isLoadingChat = createMemo(() => chat.isLoading() || initChat.isLoading())

  return (
    <>
      <Toggle
        size="icon"
        disabled={isLoadingChat()}
        pressed={open()}
        onPressedChange={(pressed, e) => {
          if (pressed) {
            const rect = (e.target as HTMLButtonElement).getBoundingClientRect()
            setFloatingPanels(
              'panels',
              produce((state) => {
                state[id] = { x: rect.left, y: rect.top }
              }),
            )

            setOpen(true)
            void initChat.mutate({ contactId: props.userId })
          }
        }}
      >
        {isLoadingChat() ? <LoaderCircle /> : <SendHorizontal />}
      </Toggle>

      <Show when={chat.data()}>{(chatData) => <ChatCard id={id} chat={chatData()} />}</Show>
    </>
  )
}

function MessagesContainer(props: { chat: FunctionReturnType<typeof api.chats.byUserId> }) {
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
    <CardContent ref={ref} class="max-h-80 overflow-auto">
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
