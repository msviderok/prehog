import { useMutation } from 'convex-solidjs'
import { MicIcon, PhoneIcon } from 'lucide-solid'
import { api } from '../../../convex/_generated/api'
import { useFloatingContext } from './FloatingPanel'
import { Button } from '../ui/button'
import { Card, CardCloseAction, CardContent, CardFooter, CardHeader, CardTitle } from '../ui/card'
import type { Id } from '../../../convex/_generated/dataModel'

export function RtcPanel(props: RtcPanel.Props) {
  const floatingContext = useFloatingContext()
  const initCall = useMutation(api.calls.initCall)

  return (
    <Card class="size-100 grid grid-rows-[auto_1fr_auto]">
      <CardHeader class="items-center bg-shade-card/50">
        <CardTitle class="row-span-2">Audio call</CardTitle>
        <CardCloseAction
          onClick={() => {
            floatingContext?.closePanel()
          }}
        />
      </CardHeader>
      <CardContent class="py-4">Content</CardContent>
      <CardFooter class="bg-shade-card/50 justify-center gap-3">
        <Button class="v-destructive">
          <MicIcon />
        </Button>
        <Button class="v-destructive">
          <PhoneIcon />
        </Button>
        <Button class="v-destructive">
          <PhoneIcon />
        </Button>
      </CardFooter>
    </Card>
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

export namespace RtcPanel {
  export interface Props {
    chatId: Id<'chats'>
  }
}
