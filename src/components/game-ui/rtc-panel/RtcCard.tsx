import { ButtonGroup, ButtonGroupText, ButtonGroupWrapper } from '@/components/ui/button-group'
import { api } from '@/convex/api'
import { useCallDuration } from '@/lib/hooks/useCallDuration'
import { useCurrentUser } from '@/lib/integrations/convex-clerk'
import { SOUNDS } from '@/lib/sounds'
import { cn } from '@/lib/utils'
import { useMutation, useQuery } from 'convex-solidjs'
import type { FunctionReturnType } from 'convex/server'
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
import {
  createContext,
  createEffect,
  createMemo,
  Match,
  onCleanup,
  Show,
  Switch,
  useContext,
  type ParentProps,
} from 'solid-js'
import { Avatar, AvatarBadgeOnline, AvatarFallback, AvatarImage } from '../../ui/avatar'
import { Button } from '../../ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../../ui/card'
import { Separator } from '../../ui/separator'
import { Toggle } from '../../ui/toggle'
import { AudioButton } from './AudioButton'
import { VideoButton } from './VideoButton'
import { useRtcContext } from './useRtcContext'

interface Props {
  callStatus: FunctionReturnType<typeof api.activeCall.status>
  theirUser: NonNullable<FunctionReturnType<typeof api.activeCall.findTheirUser>>
  myParticipant: NonNullable<FunctionReturnType<typeof api.activeCall.findMyParticipant>>
  theirParticipant: FunctionReturnType<typeof api.activeCall.findTheirParticipant> | undefined
}

const RtcCardContext = createContext<Props>()
function useRtcCardContext() {
  const context = useContext(RtcCardContext)
  if (!context) throw new Error('useRtcCardContext must be used within a RtcCardContext.Provider')

  return context
}

export function RtcCard(props: Props) {
  const duration = useCallDuration(props)

  createEffect(() => {
    console.log({ ...props })
  })

  createEffect(() => {
    if (props.myParticipant.role === 'host') {
      if (props.callStatus === 'in-progress' && SOUNDS.dial.playing() === false) {
        SOUNDS.dial.play()
        onCleanup(() => SOUNDS.dial.stop())
      }
      return
    }

    if (props.myParticipant.role === 'participant') {
      if (props.callStatus === 'awaiting-response' && SOUNDS.call.playing() === false) {
        SOUNDS.call.play()
        onCleanup(() => SOUNDS.call.stop())
      }
      return
    }
  })

  return (
    <RtcCardContext.Provider value={props}>
      <Card variant="rtc-panel">
        <CardHeader>
          <AvatarBadgeOnline isOnline inline />
          <CardTitle>{props.theirUser.fullname}</CardTitle>
          <Show when={props.callStatus === 'in-progress'}>
            <Separator orientation="vertical" />
            <span class="text-muted font-light tracking-widest">{duration()}</span>
          </Show>
        </CardHeader>

        <CardContent>
          <Show
            when={props.callStatus === 'in-progress'}
            fallback={
              <NoVideoView
                type="them-view"
                callType={
                  props.callStatus === 'preparing'
                    ? undefined
                    : props.myParticipant.role === 'host'
                      ? 'outgoing'
                      : 'incoming'
                }
              />
            }
          >
            <VideoView type="them-view" />

            <div class="absolute bottom-3 right-3 w-30">
              <VideoView type="my-view" />
            </div>
          </Show>
        </CardContent>

        <CardFooter>
          <ButtonGroup>
            <Switch>
              <Match when={props.myParticipant.role === 'host' && props.callStatus === 'preparing'}>
                <Actions.StartAudioCall />
                <Actions.StartVideoCall />
                <Actions.CancelCall />
              </Match>

              <Match when={props.myParticipant.role === 'host' && props.callStatus === 'awaiting-response'}>
                <Actions.AudioToggle />
                <Actions.VideoToggle />
                <Actions.EndCall />
              </Match>

              <Match when={props.myParticipant.role === 'participant' && props.callStatus === 'awaiting-response'}>
                <Actions.AcceptCall />
                <Actions.DeclineCall />
              </Match>

              <Match when={props.callStatus === 'in-progress'}>
                <Actions.AudioToggle />
                <Actions.VideoToggle />
                <Actions.EndCall />
              </Match>
            </Switch>
          </ButtonGroup>
        </CardFooter>
      </Card>
    </RtcCardContext.Provider>
  )
}

function VideoView(props: { type: 'my-view' | 'them-view' }) {
  const { myRTC, setRemoteVideoRef } = useRtcContext()

  const isMyView = props.type === 'my-view'
  const { data: myAudio } = useQuery(api.activeCall.myAudio, {}, { keepPreviousData: true, enabled: isMyView })
  const { data: myVideo } = useQuery(api.activeCall.myVideo, {}, { keepPreviousData: true, enabled: isMyView })
  const { data: theirAudio } = useQuery(api.activeCall.theirAudio, {}, { keepPreviousData: true, enabled: !isMyView })
  const { data: theirVideo } = useQuery(api.activeCall.theirVideo, {}, { keepPreviousData: true, enabled: !isMyView })

  const audio = createMemo(() => (props.type === 'my-view' ? (myAudio() ?? false) : (theirAudio() ?? false)))
  const video = createMemo(() => (props.type === 'my-view' ? (myVideo() ?? false) : (theirVideo() ?? false)))

  return (
    <div class="relative size-full aspect-video">
      <video
        autoplay
        playsinline
        class="border size-full object-cover"
        muted={props.type === 'my-view'}
        ref={(el) => {
          if (props.type === 'my-view') {
            myRTC.setRef(el)
            el.srcObject = myRTC.stream
          } else {
            setRemoteVideoRef(el)
          }
        }}
      />

      <NoVideoView
        type={props.type}
        class={cn('opacity-0 absolute top-0 left-0', video() === false && 'opacity-100')}
      />

      <Button
        variant="outline"
        size="icon-xs"
        class={cn(
          'absolute bottom-1 right-1 v-destructive pointer-events-none opacity-0',
          audio() === false && 'opacity-100',
        )}
      >
        <MicOffIcon class="size-4" />
      </Button>
    </div>
  )
}

function NoVideoView(
  props: ParentProps<{
    type: 'my-view' | 'them-view'
    callType?: 'incoming' | 'outgoing'
    class?: string
  }>,
) {
  const ctx = useRtcCardContext()
  const currentUser = useCurrentUser()
  const user = createMemo(() => (props.type === 'my-view' ? currentUser() : ctx.theirUser))

  return (
    <div
      class={cn(
        '@container bg-card border-white border size-full flex items-center justify-center flex-col gap-2',
        props.class,
      )}
    >
      <Avatar
        variant="on-call"
        user={user()}
        class={cn(
          props.callType != null && 'animate-bounce repeat-infinite',
          props.type === 'my-view' && 'size-[clamp(1.5rem,20cqi,3rem)]!',
        )}
      >
        <AvatarImage />
        <AvatarFallback />
      </Avatar>

      <span
        class={cn(
          'flex items-center justify-center gap-1 tracking-wide',
          props.type === 'my-view' && 'font-light text-[clamp(0.625rem,8cqi,4rem)]',
        )}
      >
        <Show when={props.callType === 'outgoing'}>
          <span>Calling</span>
        </Show>

        <span>{user()?.fullname}</span>

        <Show when={props.callType === 'incoming'}>
          <span>is calling</span>
        </Show>
      </span>
    </div>
  )
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
    const { data: myAudio } = useQuery(api.activeCall.myAudio, {})
    const toggleAudio = useMutation(api.activeCall.toggleAudio)
    return (
      <AudioButton label={myAudio() ? 'Mute' : 'Unmute'} class="v-tertiary">
        <Toggle
          variant="outline"
          pressed={myAudio() ?? false}
          onPressedChange={(pressed) => toggleAudio.mutate({ audio: pressed })}
        >
          {myAudio() ? <MicIcon /> : <MicOffIcon />}
        </Toggle>
      </AudioButton>
    )
  },
  VideoToggle() {
    const { data: myVideo } = useQuery(api.activeCall.myVideo, {})
    const toggleVideo = useMutation(api.activeCall.toggleVideo)
    return (
      <VideoButton label={myVideo() ? 'Stop Video' : 'Start Video'} class="v-tertiary">
        <Toggle
          variant="outline"
          pressed={myVideo() ?? false}
          onPressedChange={(pressed) => toggleVideo.mutate({ video: pressed })}
        >
          {myVideo() ? <VideoIcon /> : <VideoOffIcon />}
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
