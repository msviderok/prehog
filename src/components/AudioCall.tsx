import { getPanelId } from '@/lib/utils'
import { useMutation } from 'convex-solidjs'
import type { FunctionReturnType } from 'convex/server'
import { PhoneIcon } from 'lucide-solid'
import { api } from '../../convex/_generated/api'
import { useGlobalState } from './GlobalStateContext'
import { Card, CardCloseAction, CardContent, CardFooter, CardHeader, CardTitle } from './ui/card'
import { Toggle } from './ui/toggle'

export function AudioCall(props: { chat: FunctionReturnType<typeof api.chats.byUserId> }) {
  const id = getPanelId(props.chat.chat._id, 'rtc')
  const initCall = useMutation(api.calls.initCall)
  const { openFloatingPanel, closeFloatingPanel, isFloatingPanelOpen } = useGlobalState()

  return (
    <>
      <Toggle
        variant="outline"
        size="icon-xs"
        class="v-secondary"
        pressed={isFloatingPanelOpen(id)}
        disabled={isFloatingPanelOpen(id)}
        onClick={(e) => openFloatingPanel(id, e.target)}
      >
        <PhoneIcon />
      </Toggle>

      <Card floating id={id}>
        <CardHeader class="bg-red-500 p-1.5 items-center">
          <CardTitle class="row-span-2">Audio call</CardTitle>

          <CardCloseAction onClick={() => closeFloatingPanel(id)} />
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
