import { ButtonGroup, ButtonGroupText, ButtonGroupWrapper } from '@/components/ui/button-group'
import { api } from '@/convex/api'
import type { Doc } from '@/convex/dataModel'
import { useCallDuration } from '@/lib/hooks/useCallDuration'
import { SOUNDS } from '@/lib/sounds'
import { cn } from '@/lib/utils'
import { useMutation } from 'convex-solidjs'
import {
  MicIcon,
  MicOffIcon,
  PhoneIcon,
  PhoneIncomingIcon,
  PhoneOffIcon,
  VideoIcon,
  VideoOffIcon,
  XIcon,
} from 'lucide-solid'
import { createContext, createEffect, Match, on, onCleanup, Show, Switch, useContext, type Component } from 'solid-js'
import { Avatar, AvatarBadgeOnline, AvatarFallback, AvatarImage } from '../../ui/avatar'
import { Button } from '../../ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../../ui/card'
import { Separator } from '../../ui/separator'
import { Toggle } from '../../ui/toggle'
import { AudioButton } from './AudioButton'
import { VideoButton } from './VideoButton'
import { VideoView } from './VideoView'
import { Dynamic } from 'solid-js/web'

interface Props {
  user: Doc<'users'>
  state: Doc<'call_participants'>
  call: Doc<'calls'>
}

const RtcCardContext = createContext<Props>()
function useRtcCardContext() {
  const context = useContext(RtcCardContext)
  if (!context) throw new Error('useRtcCardContext must be used within a RtcCardContext.Provider')

  return context
}

function useHostEffects(props: Props) {
  if (props.state.role !== 'host') return
  createEffect(() => {
    if (props.call.status === 'in-progress' && SOUNDS.dial.playing() === false) {
      SOUNDS.dial.play()
      onCleanup(() => SOUNDS.dial.stop())
    }
  })
}

function useParticipantEffects(props: Props) {
  if (props.state.role !== 'participant') return
  createEffect(() => {
    if (props.call.status === 'awaiting-response' && SOUNDS.call.playing() === false) {
      SOUNDS.call.play()
      onCleanup(() => SOUNDS.call.stop())
    }
  })
}

export function RtcCard(props: Props) {
  useHostEffects(props)
  useParticipantEffects(props)

  const duration = useCallDuration(props)
  const isHost = props.state.role === 'host'

  return (
    <RtcCardContext.Provider value={props}>
      <Card variant="rtc-panel">
        <CardHeader>
          <AvatarBadgeOnline isOnline inline />
          <CardTitle>{props.user.fullname}</CardTitle>

          <Show when={props.call.status === 'in-progress'}>
            <Separator orientation="vertical" />
            <span class="text-muted font-light tracking-widest">{duration()}</span>
          </Show>
        </CardHeader>

        <CardContent>
          <Dynamic component={isHost ? HostContent[props.call.status] : GuestContent[props.call.status]} />
        </CardContent>

        <CardFooter>
          <ButtonGroup>
            <Dynamic component={isHost ? HostActions[props.call.status] : GuestActions[props.call.status]} />
          </ButtonGroup>
        </CardFooter>
      </Card>
    </RtcCardContext.Provider>
  )
}

function InProgressView() {
  const ctx = useRtcCardContext()
  return (
    <>
      <Avatar variant="on-call" user={ctx.user}>
        <AvatarImage />
        <AvatarFallback />
      </Avatar>
      <span>{ctx.user.fullname}</span>

      <div class="absolute top-0 left-0 w-full h-full">
        <VideoView type="them-view" />
      </div>
      <div class="absolute bottom-2 right-2 aspect-video w-30">
        <VideoView type="my-view" />

        <Show when={ctx.state.audio === false}>
          <Button variant="outline" size="icon-xs" class="absolute bottom-1 right-1 v-destructive pointer-events-none">
            <MicOffIcon class="size-4" />
          </Button>
        </Show>
      </div>
    </>
  )
}

const HostContent: Record<Doc<'calls'>['status'], Component<{}>> = {
  preparing() {
    const ctx = useRtcCardContext()
    return (
      <>
        <Avatar variant="on-call" user={ctx.user}>
          <AvatarImage />
          <AvatarFallback />
        </Avatar>
        <span>{ctx.user.fullname}</span>
      </>
    )
  },
  'awaiting-response'() {
    const ctx = useRtcCardContext()
    return (
      <>
        <Avatar variant="on-call" user={ctx.user} class="animate-bounce repeat-infinite">
          <AvatarImage />
          <AvatarFallback />
        </Avatar>
        <span class="typing">Calling {ctx.user.fullname}</span>
        <div class={cn('absolute bottom-2 right-2 aspect-video w-30')}>
          <VideoView type="my-view" />
        </div>
      </>
    )
  },
  'in-progress'() {
    return <InProgressView />
  },
}

const HostActions: Record<Doc<'calls'>['status'], Component<{}>> = {
  preparing() {
    return (
      <>
        <Actions.StartAudioCall />
        <Actions.StartVideoCall />
        <Actions.CancelCall />
      </>
    )
  },
  'awaiting-response'() {
    return (
      <>
        <Actions.AudioToggle />
        <Actions.VideoToggle />
        <Actions.EndCall />
      </>
    )
  },
  'in-progress'() {
    return (
      <>
        <Actions.AudioToggle />
        <Actions.VideoToggle />
        <Actions.EndCall />
      </>
    )
  },
}

const GuestContent: Record<Doc<'calls'>['status'], Component<{}>> = {
  preparing() {
    return null
  },
  'awaiting-response'() {
    const ctx = useRtcCardContext()
    return (
      <>
        <Avatar variant="on-call" user={ctx.user} class="animate-bounce repeat-infinite">
          <AvatarImage />
          <AvatarFallback />
        </Avatar>
        <span class="italic">{ctx.user.fullname} is calling</span>
      </>
    )
  },
  'in-progress'() {
    return <InProgressView />
  },
}

const GuestActions: Record<Doc<'calls'>['status'], Component<{}>> = {
  preparing() {
    return null
  },
  'awaiting-response'() {
    return (
      <>
        <Actions.AcceptCall />
        <Actions.DeclineCall />
      </>
    )
  },
  'in-progress'() {
    return (
      <>
        <Actions.AudioToggle />
        <Actions.VideoToggle />
        <Actions.EndCall />
      </>
    )
  },
}

const Actions = {
  StartAudioCall() {
    const startCall = useMutation(api.activeCall.start)
    return (
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
    )
  },
  StartVideoCall() {
    const startCall = useMutation(api.activeCall.start)
    return (
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
    )
  },
  AudioToggle() {
    const ctx = useRtcCardContext()
    const toggleAudio = useMutation(api.activeCall.toggleAudio)
    return (
      <AudioButton label={ctx.state.audio ? 'Mute' : 'Unmute'} class="v-tertiary">
        <Toggle
          variant="outline"
          pressed={ctx.state.audio}
          onPressedChange={(pressed) => toggleAudio.mutate({ audio: pressed })}
        >
          {ctx.state.audio ? <MicIcon /> : <MicOffIcon />}
        </Toggle>
      </AudioButton>
    )
  },
  VideoToggle() {
    const ctx = useRtcCardContext()
    const toggleVideo = useMutation(api.activeCall.toggleVideo)
    return (
      <VideoButton label={ctx.state.video ? 'Stop Video' : 'Start Video'} class="v-tertiary">
        <Toggle
          variant="outline"
          pressed={ctx.state.video}
          onPressedChange={(pressed) => toggleVideo.mutate({ video: pressed })}
        >
          {ctx.state.video ? <VideoIcon /> : <VideoOffIcon />}
        </Toggle>
      </VideoButton>
    )
  },
  AcceptCall() {
    const acceptCall = useMutation(api.activeCall.accept)
    return (
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
    )
  },
  DeclineCall() {
    const rejectCall = useMutation(api.activeCall.reject)
    return (
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
    )
  },
  EndCall() {
    const endCall = useMutation(api.activeCall.end)
    return (
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
    )
  },
  CancelCall() {
    const cancelCall = useMutation(api.activeCall.cancel)
    return (
      <ButtonGroupWrapper>
        <ButtonGroup>
          <Button variant="outline" animate="scale-icon" class="v-muted" onClick={() => cancelCall.mutate({})}>
            <XIcon />
          </Button>
        </ButtonGroup>
        <ButtonGroupText>Cancel</ButtonGroupText>
      </ButtonGroupWrapper>
    )
  },
}
