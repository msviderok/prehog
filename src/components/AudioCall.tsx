import { useMutation } from 'convex-solidjs'
import type { FunctionReturnType } from 'convex/server'
import { PhoneIcon, XIcon } from 'lucide-solid'
import { createSignal } from 'solid-js'
import { api } from '../../convex/_generated/api'
import { Toggle } from './ui/toggle'
import { Card, CardAction, CardContent, CardFooter, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'

export function AudioCall(props: { chat: FunctionReturnType<typeof api.chats.byUserId> }) {
  const [open, setOpen] = createSignal(false)
  const initCall = useMutation(api.calls.initCall)

  return (
    <>
      <Toggle variant="outline" size="sm" class="v-secondary" pressed={open()} onPressedChange={setOpen}>
        <PhoneIcon />
      </Toggle>

      <Card floating id={`rtc-call-${props.chat.chat._id}`}>
        <CardHeader class="bg-red-500 p-1.5 items-center">
          <CardTitle class="row-span-2">Audio call</CardTitle>

          <CardAction>
            <Button size="icon">
              <XIcon />
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent>Content</CardContent>
        <CardFooter>Footer</CardFooter>
      </Card>
    </>
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
