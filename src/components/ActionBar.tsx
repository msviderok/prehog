import { cn, getPanelId } from '@/lib/utils'
import { makePersisted } from '@solid-primitives/storage'
import { useQuery } from 'convex-solidjs'
import type { FunctionReturnType } from 'convex/server'
import { UserPlusIcon, UsersIcon } from 'lucide-solid'
import { createSignal, For, Show } from 'solid-js'
import { api } from '../../convex/_generated/api'
import { ChatWindow } from './ChatWindow'
import { useGlobalState } from './GlobalStateContext'
import { Avatar } from './ui/avatar'
import { Button } from './ui/button'
import { Card, CardCloseAction, CardContent, CardFooter, CardHeader, CardTitle } from './ui/card'
import { Toggle } from './ui/toggle'

export function ActionBar() {
  const [open, setOpen] = makePersisted(createSignal(false), { name: 'users-list' })
  const { data: usersWithChat } = useQuery(api.users.usersWithChat, {})

  return (
    <div class="fixed top-0 left-0 p-4 flex z-1 items-center gap-4 w-full justify-between">
      <Show
        when={open()}
        fallback={
          <Button class="v-accent" size="icon" onClick={() => setOpen(true)}>
            <UsersIcon />
          </Button>
        }
      >
        <Card>
          <CardHeader>
            <CardTitle class="row-span-2">Users</CardTitle>
            <CardCloseAction onClick={() => setOpen(false)} />
          </CardHeader>
          <CardContent class="p-0! max-w-80 w-80 overflow-hidden">
            <For each={usersWithChat()}>{UserListItem}</For>
          </CardContent>
          <CardFooter>
            <Button size="sm" variant="plain" class="v-secondary">
              <UserPlusIcon /> Message user
            </Button>
          </CardFooter>
        </Card>
      </Show>
    </div>
  )
}

function UserListItem(props: FunctionReturnType<typeof api.users.usersWithChat>[number]) {
  let userRef!: HTMLDivElement
  const { isFloatingPanelOpen, openFloatingPanel, closeFloatingPanel } = useGlobalState()
  const id = getPanelId(props.chat.chat._id, 'chat')
  const { data: currentUser } = useQuery(api.users.current, {})
  const { data: lastMessage } = useQuery(api.chats.lastMessage, () => ({ chatId: props.chat.chat._id }))

  return (
    <Toggle
      pressed={isFloatingPanelOpen(id)}
      onPressedChange={(pressed) => {
        if (pressed) {
          openFloatingPanel(id, userRef)
        } else {
          closeFloatingPanel(id)
        }
      }}
      render={(p) => (
        <div
          {...p}
          class={cn(
            p.class,
            'flex gap-2 items-center hover:bg-tint-card/10 data-pressed:bg-blue-200/30 p-2 overflow-hidden',
          )}
          ref={(el) => {
            p.ref(el)
            userRef = el
          }}
        >
          <Avatar user={props.user} />
          <Show when={lastMessage()} keyed>
            {(msg) => (
              <div class="font-light grid grid-cols-2 grid-rows-2 items-center w-full">
                <span>{props.user.fullname}</span>
                <span class="text-muted justify-self-end">{msg.createdAt}</span>
                <div class="flex items-center gap-1 text-xs overflow-hidden col-span-2 select-none">
                  <Show when={msg.fromUserId === currentUser()?._id}>
                    <span class="text-blue-300">You:</span>
                  </Show>
                  <p class="text-tint-muted/30 truncate">{msg.body}</p>
                </div>
              </div>
            )}
          </Show>

          <ChatWindow id={id} chat={props.chat} />
        </div>
      )}
    />
  )
}
