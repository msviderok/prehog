import { Separator } from '@/components/ui/separator'
import { api } from '@/convex/api'
import type { Doc } from '@/convex/dataModel'
import { useCallDuration } from '@/lib/hooks/useCallDuration'
import { SOUNDS } from '@/lib/sounds'
import { useMutation } from 'convex-solidjs'
import { MicIcon, MicOffIcon, PhoneIcon, PhoneIncomingIcon, PhoneOffIcon, VideoIcon, VideoOffIcon } from 'lucide-solid'
import { createEffect, Match, onCleanup, Show, Switch } from 'solid-js'
import { Avatar, AvatarBadgeOnline, AvatarFallback, AvatarImage } from '../../ui/avatar'
import { Button } from '../../ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../../ui/card'
import { Toggle } from '../../ui/toggle'
import { AudioButton } from './AudioButton'
import { ButtonGroup, ButtonGroupText, ButtonGroupWrapper } from '@/components/ui/button-group'
import { VideoButton } from './VideoButton'

interface Props {
  user: Doc<'users'>
  state: Doc<'call_participants'>
  call: Doc<'calls'>
}

export function GuestPanel(props: Props) {
  createEffect(() => {
    if (props.call.status === 'awaiting-response' && SOUNDS.call.playing() === false) {
      SOUNDS.call.play()
      onCleanup(() => SOUNDS.call.stop())
    }
  })

  return (
    <Card variant="rtc-panel">
      <CardHeader>
        <Header {...props} />
      </CardHeader>
      <CardContent>
        <Content {...props} />
      </CardContent>
      <CardFooter>
        <Footer {...props} />
      </CardFooter>
    </Card>
  )
}

function Header(props: Props) {
  const duration = useCallDuration(props)
  return (
    <>
      <AvatarBadgeOnline isOnline inline />
      <CardTitle>{props.user.fullname}</CardTitle>
      <Show when={props.call.status === 'in-progress'}>
        <Separator orientation="vertical" />
        <span class="text-muted font-light tracking-widest">{duration()}</span>
      </Show>
    </>
  )
}

function Content(props: Props) {
  return (
    <Switch>
      <Match when={props.call.status === 'awaiting-response'}>
        <Avatar variant="on-call" user={props.user} class="animate-bounce repeat-infinite">
          <AvatarImage />
          <AvatarFallback />
        </Avatar>
        <span class="italic">{props.user.fullname} is calling</span>
      </Match>
      <Match when={props.call.status === 'in-progress'}>
        <Avatar variant="on-call" user={props.user}>
          <AvatarImage />
          <AvatarFallback />
        </Avatar>
        <span>{props.user.fullname}</span>
      </Match>
    </Switch>
  )
}

function Footer(props: Props) {
  const acceptCall = useMutation(api.activeCall.accept)
  const endCall = useMutation(api.activeCall.end)
  const rejectCall = useMutation(api.activeCall.reject)
  const toggleAudio = useMutation(api.activeCall.toggleAudio)
  const toggleVideo = useMutation(api.activeCall.toggleVideo)

  return (
    <ButtonGroup>
      <Switch>
        <Match when={props.call.status === 'awaiting-response'}>
          <AudioButton label="Accept">
            <Button
              variant="outline"
              class="v-secondary"
              onClick={async () => {
                await acceptCall.mutate({})
                SOUNDS.accept.play()
              }}
            >
              <PhoneIncomingIcon />
            </Button>
          </AudioButton>

          <ButtonGroupWrapper>
            <Button
              variant="outline"
              class="v-destructive"
              onClick={async () => {
                await rejectCall.mutate({})
                SOUNDS.reject.play()
              }}
            >
              <PhoneOffIcon />
            </Button>
            <ButtonGroupText>Decline</ButtonGroupText>
          </ButtonGroupWrapper>
        </Match>
        <Match when={props.call.status === 'in-progress'}>
          <AudioButton label={props.state.audio ? 'Mute' : 'Unmute'} class="v-tertiary">
            <Toggle
              variant="outline"
              pressed={props.state.audio}
              onPressedChange={(pressed) => toggleAudio.mutate({ audio: pressed })}
            >
              {props.state.audio ? <MicIcon /> : <MicOffIcon />}
            </Toggle>
          </AudioButton>

          <VideoButton label={props.state.video ? 'Stop video' : 'Start video'} class="v-tertiary">
            <Toggle
              variant="outline"
              pressed={props.state.video}
              onPressedChange={(pressed) => toggleVideo.mutate({ video: pressed })}
            >
              {props.state.video ? <VideoIcon /> : <VideoOffIcon />}
            </Toggle>
          </VideoButton>

          <ButtonGroupWrapper>
            <Button
              variant="outline"
              class="v-destructive"
              onClick={async () => {
                await endCall.mutate({})
                SOUNDS.end.play()
              }}
            >
              <PhoneIcon />
            </Button>
            <ButtonGroupText>End call</ButtonGroupText>
          </ButtonGroupWrapper>
        </Match>
      </Switch>
    </ButtonGroup>
  )
}
