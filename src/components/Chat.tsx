import { cn } from '@/lib/utils'
import { debounce, throttle } from '@solid-primitives/scheduled'
import { makePersisted } from '@solid-primitives/storage'
import { useMutation, useQuery } from 'convex-solidjs'
import type { FunctionReturnType } from 'convex/server'
import { LoaderCircle, SendHorizontal } from 'lucide-solid'
import { createEffect, createMemo, createSignal, For, on, Show } from 'solid-js'
import { api } from '../../convex/_generated/api'
import type { Id } from '../../convex/_generated/dataModel'
import { Avatar } from './ui/avatar'
import { Button } from './ui/button'
import { Card, CardContent, CardFooter, CardHeader } from './ui/card'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'
import { Textarea } from './ui/textarea'

export function Chat(props: { userId: Id<'users'> }) {
  const [text, setText] = createSignal('')
  const [open, setOpen] = makePersisted(createSignal<Id<'chats'> | null>(null), { name: 'chat-open' })

  const chat = useQuery(api.chats.byUserId, { userId: props.userId })

  const initChat = useMutation(api.chats.initChat)
  const sendMessage = useMutation(api.chats.sendMessage)
  const signalMeTyping = useMutation(api.chats.signalTyping)

  const isLoadingChat = createMemo(() => chat.isLoading() || initChat.isLoading())

  const signalTypingStart = throttle(() => {
    signalMeTyping.mutateAsync({ isTyping: true, memberId: chat.data()!.myMember._id })
  }, 500)
  const signalTypingEnd = debounce(() => {
    signalMeTyping.mutateAsync({ isTyping: false, memberId: chat.data()!.myMember._id })
  }, 1000)

  return (
    <Popover
      open={open() === chat.data()?.chat._id}
      onOpenChange={async (isOpen, e, reason) => {
        if (reason === 'outside-press') return

        if (isOpen) {
          const { chatId } = await initChat.mutateAsync({ contactId: props.userId })
          setOpen(chatId)
        } else {
          setOpen(null)
        }
      }}
    >
      <PopoverTrigger render={{ component: Button, size: 'sm' }} disabled={isLoadingChat()}>
        {isLoadingChat() ? <LoaderCircle /> : <SendHorizontal />}
      </PopoverTrigger>

      <Show when={chat.data()}>
        {(chatData) => (
          <PopoverContent render={{ component: Card }} class="p-0">
            <CardHeader>
              <div class="flex gap-2 items-center">
                <Avatar user={chatData().contact} />
                <div class="flex flex-col gap-0">
                  <span class="text-sm font-semibold">{chatData().contact.fullname}</span>
                  <span class={cn('text-muted leading-tight', chatData().contact.isOnline && 'text-blue-400')}>
                    {chatData().contactMember.itTyping
                      ? 'Typing...'
                      : chatData().contact.isOnline
                        ? 'Online'
                        : 'Offline'}
                  </span>
                </div>
              </div>
            </CardHeader>

            <MessagesContainer chat={chatData()} />

            <CardFooter class="p-0">
              <Textarea
                value={text()}
                onInput={(e) => setText(e.target.value)}
                placeholder="Write a message..."
                disabled={sendMessage.isLoading()}
                onKeyDown={async (e) => {
                  signalTypingStart()
                  signalTypingEnd()

                  if (e.key === 'Enter') {
                    await sendMessage.mutateAsync({
                      chatId: chatData().chat._id,
                      chatMemberId: chatData().myMember._id,
                      body: text(),
                    })
                    setText('')
                  }
                }}
              />
            </CardFooter>
          </PopoverContent>
        )}
      </Show>
    </Popover>
  )
}

function MessagesContainer(props: { chat: FunctionReturnType<typeof api.chats.byUserId> }) {
  let ref!: HTMLDivElement
  let mounted = false
  const [atBottom, setAtBottom] = createSignal(false)
  const { data: messages } = useQuery(
    api.chats.messages,
    () => ({ chatId: props.chat.chat._id }),
    () => ({ enabled: props.chat.chat._id != null, initialData: [] }),
  )

  createEffect(
    on([atBottom, messages], ([shouldScroll]) => {
      if (ref.scrollHeight === 0) return

      const top = ref.scrollHeight - ref.clientHeight
      if (mounted === false) {
        mounted = true
        ref.scrollTo({ top, behavior: 'auto' })
      }

      if (shouldScroll) {
        ref.scrollTo({ top, behavior: 'auto' })
      }
    }),
  )

  return (
    <CardContent
      ref={ref}
      class="grid auto-rows-auto max-h-80 overflow-auto [overflow-anchor:auto]"
      onScroll={({ target }) => {
        setAtBottom(target.scrollHeight - target.scrollTop <= target.clientHeight)
      }}
    >
      <For each={messages()}>
        {(message) => (
          <div
            class={cn(
              'w-max p-1.5 px-2.5 rounded-xl text-white',
              message.chatMemberId === props.chat.myMember._id && 'bg-blue-400 justify-self-end [contrast-c]',
              message.chatMemberId === props.chat.contactMember._id && 'bg-indigo-400 justify-self-start',
            )}
          >
            <span>{message.body}</span>
          </div>
        )}
      </For>
    </CardContent>
  )
}
