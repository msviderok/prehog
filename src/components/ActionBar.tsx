import { useQuery } from 'convex-solidjs'
import { HeartXIcon, MessageSquareText, PhoneIcon, UsersIcon, XIcon } from 'lucide-solid'
import { createSignal, For } from 'solid-js'
import { api } from '../../convex/_generated/api'
import { Chat } from './Chat'
import { useGlobalState } from './GlobalStateContext'
import { Avatar } from './ui/avatar'
import { Button } from './ui/button'
import { Card, CardAction, CardContent, CardHeader, CardTitle } from './ui/card'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'
import { cn } from '@/lib/utils'

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
          <PopoverTrigger render={{ component: Button, size: 'icon' }}>
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
                        <Chat userId={user._id} />
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

function RindAudioAction() {
  const [open, setOpen] = createSignal(false)
  return (
    <Popover open={open()} onOpenChange={setOpen}>
      <PopoverTrigger render={{ component: Button, size: 'icon' }}>
        <PhoneIcon />
      </PopoverTrigger>

      <PopoverContent render={(props) => <Card {...props} class={cn(props.class, 'flex gap-3 flex-col w-100 p-0!')} />}>
        <CardHeader class="bg-red-500 p-1.5 items-center">
          <CardTitle class="row-span-2">Audio call</CardTitle>

          <CardAction>
            <Button size="icon" onClick={() => setOpen(false)}>
              <XIcon />
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent></CardContent>
      </PopoverContent>
    </Popover>
  )
}

async function initRTC(rtc: GlobalState.RTC) {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    })
    stream.getTracks().forEach((track) => rtc.pc.addTrack(track, stream))
    // callUser.mutate({ calleeId: user._id, type: "video" });

    // player.rtc.pc.ontrack = (e) => {
    //   console.log(e.track.kind)
    // }
    // player.rtc.pc.onicecandidate = (e) => {
    //   if (e.candidate) {
    //     console.log(123)
    //   }
    // }

    // setPlayer('rtc', )
  } catch (e) {}
}
