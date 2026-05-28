import { useQuery } from 'convex-solidjs'
import { Headset, MessageSquareText } from 'lucide-solid'
import { createEffect, createSignal, For } from 'solid-js'
import { api } from '../../convex/_generated/api'
import { Chat } from './Chat'
import { useGlobalState } from './GlobalStateContext'
import { Avatar } from './ui/avatar'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible'
import { Toggle } from './ui/toggle'

export function ActionBar() {
  return (
    <div class="fixed top-0 left-0 p-4 flex z-1 items-center gap-4 w-full justify-between">
      <div class="flex gap-1 items-center">
        <ChatAction />
        {/* <UserButton /> */}
      </div>
    </div>
  )
}

function ChatAction() {
  const [open, setOpen] = createSignal(true)
  const { rtc } = useGlobalState()
  const { data: allUsers } = useQuery(api.users.listAllUsers, {}, { initialData: [], keepPreviousData: true })

  return (
    <Collapsible open={open()} onOpenChange={setOpen}>
      <CollapsibleTrigger>
        <MessageSquareText />
      </CollapsibleTrigger>

      <CollapsibleContent class="flex gap-3 flex-col w-100" render={{ component: Card }}>
        <CardHeader>
          <CardTitle>Users</CardTitle>
        </CardHeader>
        <CardContent>
          <For each={allUsers()}>
            {(user) => {
              console.log(123)
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

        {/* <CardFooter>
              <Toggle>
                <Headset />
              </Toggle>
              <Toggle>
                <Video />
              </Toggle>
            </CardFooter> */}
      </CollapsibleContent>
    </Collapsible>
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
