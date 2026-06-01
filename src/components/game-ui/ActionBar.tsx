import { getLSKey } from '@/lib/utils'
import { makePersisted } from '@solid-primitives/storage'
import { useQuery } from 'convex-solidjs'
import { BugIcon, UserPlusIcon, UsersIcon } from 'lucide-solid'
import { createMemo, createSignal, For, Show } from 'solid-js'
import { api } from '../../../convex/_generated/api'
import type { Doc } from '../../../convex/_generated/dataModel'
import { useGlobalState } from '../GlobalStateContext'
import { Button } from '../ui/button'
import { Card, CardCloseAction, CardContent, CardFooter, CardHeader, CardTitle } from '../ui/card'
import { Toggle } from '../ui/toggle'
import { UserCard } from './UserCard'

export function ActionBar() {
  const { debug, setDebug } = useGlobalState()
  const [open, setOpen] = makePersisted(createSignal(false), { name: getLSKey('users-list') })
  const usersWithChat = useQuery(api.users.usersWithChat, {}, { keepPreviousData: true })
  return (
    <div class="fixed top-0 left-0 p-4 flex z-1 items-center gap-4 w-full justify-between">
      <Show
        when={open()}
        fallback={
          <div class="flex items-center gap-2">
            <Button class="v-accent" size="icon" onClick={() => setOpen(true)}>
              <UsersIcon />
            </Button>
            <Toggle class="v-accent" size="icon" pressed={debug()} onPressedChange={setDebug}>
              <BugIcon />
            </Toggle>
          </div>
        }
      >
        <Card>
          <CardHeader>
            <CardTitle class="row-span-2">Users</CardTitle>
            <CardCloseAction onClick={() => setOpen(false)} />
          </CardHeader>
          <CardContent class="p-0! max-w-80 w-80 overflow-hidden">
            <For each={usersWithChat.data()}>{(user) => <UserListItem {...user} />}</For>
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

function UserListItem(props: Doc<'users'>) {
  const { openFloatingPanel } = useGlobalState()
  const { data: chat } = useQuery(api.chats.byUserId, { userId: props._id })
  const { data: floatingPanel } = useQuery(
    api.floatingPanels.byChatAndType,
    () => ({ chatId: chat()?._id as any, type: 'chat' as const }),
    () => ({ enabled: chat()?._id != null }),
  )

  const isChatOpen = createMemo(() => !!floatingPanel())

  return (
    <Toggle
      pressed={isChatOpen()}
      onPressedChange={(pressed, { target }) => {
        if (!pressed) return
        if (!chat()?._id) throw new Error('Chat not found')
        openFloatingPanel({ type: 'chat', target: target as Element, chatId: chat()!._id })
      }}
      render={(p) => {
        return <UserCard {...p} user={props} />
      }}
    />
  )
}
