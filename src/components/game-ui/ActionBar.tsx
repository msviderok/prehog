import { api } from '@/convex/api'
import type { Doc } from '@/convex/dataModel'
import { getLSKey, getNewPanelPosition } from '@/lib/utils'
import { makePersisted } from '@solid-primitives/storage'
import { useUser } from 'clerk-solidjs-tanstack-start'
import { useMutation, useQuery } from 'convex-solidjs'
import { ChevronsLeftIcon, MessageSquarePlusIcon } from 'lucide-solid'
import { createMemo, createSignal, For, Show } from 'solid-js'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { Button } from '../ui/button'
import { Card, CardCloseAction, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Input } from '../ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { Toggle } from '../ui/toggle'
import { UserCard } from './UserCard'

export function ActionBar() {
  const user = useUser()
  const [open, setOpen] = makePersisted(createSignal(false), { name: getLSKey('users-list') })
  const [activeTab, setActiveTab] = makePersisted(createSignal<'chats' | 'users'>('chats'), {
    name: getLSKey('active-tab'),
  })
  const usersWithChat = useQuery(api.users.usersWithChat, {}, { keepPreviousData: true })
  const unconnectedUsers = useQuery(api.users.unconnectedUsers, {}, { keepPreviousData: true })

  return (
    <div data-interactive="true" class="fixed top-0 left-0 p-4 flex z-1 items-start gap-4 w-full">
      <Card
        data-open={open()}
        class="w-14 h-14 transition-all ease-out overflow-hidden whitespace-nowrap border-none data-open:size-90 ring-0! bg-transparent data-open:ring-1! data-open:bg-card *:data-[slot=card-content]:opacity-0 data-open:*:data-[slot=card-content]:opacity-100"
      >
        <CardHeader class="flex items-center justify-between gap-2">
          <div class="grid grid-cols-[auto_1fr] grid-rows-2 gap-x-3 group cursor-pointer">
            <Avatar
              class="row-span-full self-center outline-accent outline-2 md:size-7"
              role="button"
              onPointerDown={() => setOpen((v) => !v)}
            >
              <AvatarImage src={user.user()?.imageUrl} />
              <AvatarFallback fullName={user.user()?.fullName} />
            </Avatar>
            <CardTitle
              // @ts-expect-error content is a valid attribute
              content={user.user()?.fullName ?? ''}
              class="after:absolute after:top-0 after:left-0 after:size-full relative after:content-[attr(content)] after:text-accent after:w-0 after:whitespace-nowrap after:overflow-hidden group-hover:after:w-full after:transition-all after:duration-300 after:ease-out group-hover:text-foreground/50 transition-colors duration-300 linear opacity-0 group-data-open/card:opacity-100"
            >
              {user.user()?.fullName}
            </CardTitle>

            <div class="text-xs text-tint-muted/30 col-2 flex items-center gap-1 opacity-0 group-data-open/card:opacity-100">
              <ChevronsLeftIcon class="h-3.5 relative -top-px transition-all group-hover:animate-shakeX group-hover:opacity-100 opacity-0 w-0 group-hover:w-3.5" />
              <span class="-translate-x-1 group-hover:translate-x-0">Click to open Clerk settings</span>
            </div>
          </div>
          <CardCloseAction onClick={() => setOpen(false)} />
        </CardHeader>
        <CardContent class="p-0 transition-opacity delay-50 duration-300">
          <Tabs value={activeTab()} onValueChange={setActiveTab}>
            <TabsList variant="line">
              <TabsTrigger value="chats">Chats</TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
            </TabsList>

            <TabsContent value="chats">
              <Show
                when={usersWithChat.data()?.length}
                fallback={
                  <div class="text-sm text-muted font-extralight tracking-wide flex flex-col items-center min-h-40 justify-center gap-2">
                    <span>You don't have any chats yet</span>
                    <Button size="md" variant="plain" onClick={() => setActiveTab('users')}>
                      <MessageSquarePlusIcon />
                      Message user
                    </Button>
                  </div>
                }
              >
                <For each={usersWithChat.data()}>{(user) => <UserListItem {...user} />}</For>
              </Show>
            </TabsContent>
            <TabsContent value="users">
              <Show
                when={unconnectedUsers.data()?.length}
                fallback={
                  <div class="text-sm text-muted font-extralight tracking-wide flex flex-col items-center min-h-40 justify-center gap-1">
                    <span>You already connected with them all.</span>
                    <span class="text-sm font-bold">Impressive!</span>
                  </div>
                }
              >
                <div class="flex flex-col w-full gap-1">
                  <Input placeholder="Start typing users name..." />
                  <For each={unconnectedUsers.data()}>{(user) => <UnconnectedUserListItem {...user} />}</For>
                </div>
              </Show>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

function UserListItem(props: Doc<'users'>) {
  let ref!: HTMLButtonElement
  const openChat = useMutation(api.chats.openChat)
  const { data: chat } = useQuery(api.chats.findByUserId, { userId: props._id })
  const { data: floatingPanel } = useQuery(
    api.floatingPanels.byType,
    () => ({ params: { type: 'chat' as const, chatId: chat()?._id as any } }),
    () => ({ enabled: chat()?._id != null }),
  )

  const isChatOpen = createMemo(() => !!floatingPanel())

  return (
    <Toggle
      ref={ref}
      pressed={isChatOpen()}
      onPressedChange={(pressed) => {
        if (!pressed) return
        if (!chat()?._id) throw new Error('Chat not found')
        openChat.mutate({ ...getNewPanelPosition(ref), userId: props._id })
      }}
      render={(p) => <UserCard {...p} user={props} isLoading={openChat.isLoading()} />}
    />
  )
}

function UnconnectedUserListItem(props: Doc<'users'>) {
  let ref!: HTMLDivElement
  const initChat = useMutation(api.chats.initChat)
  return (
    <UserCard
      ref={ref}
      user={props}
      isLoading={initChat.isLoading()}
      onClick={async () => {
        initChat.mutate({ ...getNewPanelPosition(ref), userId: props._id })
      }}
    />
  )
}
