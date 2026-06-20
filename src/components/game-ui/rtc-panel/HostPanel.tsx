import { ButtonGroup, ButtonGroupText, ButtonGroupWrapper } from '@/components/ui/button-group'
import { api } from '@/convex/api'
import type { Doc } from '@/convex/dataModel'
import { useCallDuration } from '@/lib/hooks/useCallDuration'
import { SOUNDS } from '@/lib/sounds'
import { cn } from '@/lib/utils'
import { useMutation } from 'convex-solidjs'
import { MicIcon, MicOffIcon, PhoneIcon, VideoIcon, VideoOffIcon, XIcon } from 'lucide-solid'
import { createEffect, Match, on, onCleanup, Show, Switch } from 'solid-js'
import { Avatar, AvatarBadgeOnline, AvatarFallback, AvatarImage } from '../../ui/avatar'
import { Button } from '../../ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../../ui/card'
import { Separator } from '../../ui/separator'
import { Toggle } from '../../ui/toggle'
import { AudioButton } from './AudioButton'
import { VideoButton } from './VideoButton'
import { VideoView } from './VideoView'

interface Props {
  user: Doc<'users'>
  state: Doc<'call_participants'>
  call: Doc<'calls'>
}

export function HostPanel(props: Props) {
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
      <Match when={props.call.status === 'preparing'}>
        <Avatar variant="on-call" user={props.user}>
          <AvatarImage />
          <AvatarFallback />
        </Avatar>
        <span>{props.user.fullname}</span>
      </Match>
      <Match when={props.call.status === 'awaiting-response'}>
        <Avatar variant="on-call" user={props.user} class="animate-bounce repeat-infinite">
          <AvatarImage />
          <AvatarFallback />
        </Avatar>
        <span class="typing">Calling {props.user.fullname}</span>
        <div class={cn('absolute bottom-2 right-2 aspect-video w-30')}>
          <VideoView type="my-view" />
        </div>
      </Match>
      <Match when={props.call.status === 'in-progress'}>
        <Avatar variant="on-call" user={props.user}>
          <AvatarImage />
          <AvatarFallback />
        </Avatar>
        <span>{props.user.fullname}</span>

        <div class="absolute top-0 left-0 w-full h-full">
          <VideoView type="them-view" />
        </div>
        <div class="absolute bottom-2 right-2 aspect-video w-30">
          <VideoView type="my-view" />
        </div>
      </Match>
    </Switch>
  )
}

function Footer(props: Props) {
  const startCall = useMutation(api.activeCall.start)
  const cancelCall = useMutation(api.activeCall.cancel)
  const endCall = useMutation(api.activeCall.end)
  const toggleAudio = useMutation(api.activeCall.toggleAudio)
  const toggleVideo = useMutation(api.activeCall.toggleVideo)

  /* When the user declines the call, the panel gets unmounted so we need to stop the dial */
  onCleanup(() => SOUNDS.dial.stop())

  /* Stop the dial when the user picks up */
  createEffect(
    on(
      () => props.call.status,
      (status) => {
        if (SOUNDS.dial.playing() && status === 'in-progress') {
          SOUNDS.dial.stop()
        }
      },
    ),
  )

  return (
    <ButtonGroup>
      <Switch>
        <Match when={props.call.status === 'preparing'}>
          <AudioButton label="Start Call" class="v-tertiary">
            <Button
              variant="outline"
              animate="scale-icon"
              onClick={async () => {
                await startCall.mutate({ audio: true, video: false })
                SOUNDS.dial.play()
              }}
            >
              <PhoneIcon />
            </Button>
          </AudioButton>

          <VideoButton label="Start Video" class="v-tertiary">
            <Button
              variant="outline"
              animate="scale-icon"
              onClick={async () => {
                await startCall.mutate({ audio: true, video: true })
                SOUNDS.dial.play()
              }}
            >
              <VideoIcon />
            </Button>
          </VideoButton>

          <ButtonGroupWrapper>
            <ButtonGroup>
              <Button variant="outline" animate="scale-icon" class="v-muted" onClick={() => cancelCall.mutate({})}>
                <XIcon />
              </Button>
            </ButtonGroup>
            <ButtonGroupText>Cancel</ButtonGroupText>
          </ButtonGroupWrapper>
        </Match>

        <Match when={props.call.status === 'awaiting-response' || props.call.status === 'in-progress'}>
          <ButtonGroup>
            <AudioButton label={props.state.audio ? 'Mute' : 'Unmute'} class="v-tertiary">
              <Toggle
                variant="outline"
                pressed={props.state.audio}
                onPressedChange={(pressed) => toggleAudio.mutate({ audio: pressed })}
              >
                {props.state.audio ? <MicIcon /> : <MicOffIcon />}
              </Toggle>
            </AudioButton>

            <VideoButton label={props.state.video ? 'Stop Video' : 'Start Video'} class="v-tertiary">
              <Toggle
                variant="outline"
                pressed={props.state.video}
                onPressedChange={(pressed) => toggleVideo.mutate({ video: pressed })}
              >
                {props.state.video ? <VideoIcon /> : <VideoOffIcon />}
              </Toggle>
            </VideoButton>

            <ButtonGroupWrapper>
              <ButtonGroup>
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
              </ButtonGroup>
              <ButtonGroupText>End call</ButtonGroupText>
            </ButtonGroupWrapper>
          </ButtonGroup>
        </Match>
      </Switch>
    </ButtonGroup>
  )
}
