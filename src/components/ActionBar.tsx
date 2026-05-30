import { useQuery } from 'convex-solidjs'
import { UsersIcon } from 'lucide-solid'
import { createSignal, For } from 'solid-js'
import { api } from '../../convex/_generated/api'
import { ChatWindow } from './ChatWindow'
import { Avatar } from './ui/avatar'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'

export function ActionBar() {
  const [open, setOpen] = createSignal(true)
  const { data: allUsers } = useQuery(api.users.listAllUsers, {}, { initialData: [], keepPreviousData: true })

  return (
    <div class="fixed top-0 left-0 p-4 flex z-1 items-center gap-4 w-full justify-between">
      <div class="flex gap-1 items-center">
        <Popover
          open={open()}
          onOpenChange={(isOpen, e, reason) => {
            if (reason !== 'trigger-press') return
            setOpen(isOpen)
          }}
        >
          <PopoverTrigger render={(props) => <Button {...props} size="icon" />}>
            <UsersIcon />
          </PopoverTrigger>

          <PopoverContent class="flex gap-3 flex-col w-100" render={{ component: Card }}>
            <CardHeader>
              <CardTitle>Users</CardTitle>
            </CardHeader>
            <CardContent>
              <For each={allUsers()}>
                {(user) => {
                  return (
                    <div class="flex gap-3 items-center">
                      <Avatar user={user} />
                      <span class="text-sm font-semibold">{user.fullname}</span>
                      <div class="flex gap-2 items-center">
                        <ChatWindow userId={user._id} />
                      </div>
                    </div>
                  )
                }}
              </For>
            </CardContent>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  )
}
