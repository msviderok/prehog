import { useCallDuration } from '@/components/game-ui/rtc-panel/useCallDuration'
import { useGlobalState } from '@/components/GlobalStateContext'
import { ButtonGroup, ButtonGroupText, ButtonGroupWrapper } from '@/components/ui/button-group'
import { api } from '@/convex/api'
import { useCurrentUser } from '@/lib/integrations/convex-clerk'
import { SOUNDS } from '@/lib/sounds'
import { cn } from '@/lib/utils'
import { useMutation, useQuery } from 'convex-solidjs'
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
  createMemo,
  Match,
  onCleanup,
  onMount,
  Show,
  splitProps,
  Switch,
  type ComponentProps,
  type ParentProps,
} from 'solid-js'
import { Avatar, AvatarBadgeOnline, AvatarFallback, AvatarImage } from '../../ui/avatar'
import { Button } from '../../ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../../ui/card'
import { Separator } from '../../ui/separator'
import { Toggle } from '../../ui/toggle'
import { AudioButton } from './AudioButton'
import {
  useHandleIceCandidates,
  useHandleMediaToggle,
  useHandleReceiveAnswer,
  useHandleReceiveOfferAndSendAnswer,
  useHandleRtcCleanup,
  useHandleSendOffer,
  useHandleSound,
} from './useRtcHandlers'
import { VideoButton } from './VideoButton'

export namespace RtcPanel {
  export type Props = PanelTypeRTC
}

export function RtcPanel(_props: RtcPanel.Props) {
  const { data: callStatus } = useQuery(api.activeCall.status, {})
  const { data: theirUser } = useQuery(api.activeCall.findTheirUser, {})
  const { data: myRole } = useQuery(api.activeCall.myRole, {})
  return (
    <Show when={callStatus() && theirUser() && myRole()}>
      <RtcPanelContent />
    </Show>
  )
}

function RtcPanelContent() {
  let myRef!: HTMLVideoElement
  let remoteRef!: HTMLVideoElement
  const duration = useCallDuration()
  const { rtc } = useGlobalState()
  const { data: callStatus } = useQuery(api.activeCall.status, {})
  const { data: myRole } = useQuery(api.activeCall.myRole, {})
  const { data: theirUser } = useQuery(api.activeCall.findTheirUser, {})

  useHandleSound()
  useHandleMediaToggle()
  useHandleRtcCleanup()

  useHandleSendOffer()
  useHandleReceiveOfferAndSendAnswer()
  useHandleReceiveAnswer()
  useHandleIceCandidates()

  onMount(() => rtc.initRtc(myRef, remoteRef))
  onCleanup(() => rtc.cleanup())

  return (
    <Card variant="rtc-panel">
      <CardHeader>
        <AvatarBadgeOnline isOnline inline />
        <Show when={theirUser()}>{(u) => <CardTitle>{u().fullname}</CardTitle>}</Show>
        <Show when={callStatus() === 'in-progress'}>
          <Separator orientation="vertical" />
          <span class="text-muted font-light tracking-widest">{duration()}</span>
        </Show>
      </CardHeader>

      <CardContent>
        <VideoView ref={remoteRef} type="them-view" />

        <div class="absolute bottom-3 right-3 w-30">
          <VideoView ref={myRef} type="my-view" />
        </div>
      </CardContent>

      <CardFooter>
        <ButtonGroup>
          <Switch>
            <Match when={myRole() === 'host' && callStatus() === 'preparing'}>
              <Actions.StartAudioCall />
              {/*<Actions.StartVideoCall />*/}
              <Actions.CancelCall />
            </Match>

            <Match when={myRole() === 'host' && callStatus() === 'awaiting-response'}>
              <Actions.AudioToggle />
              <Actions.VideoToggle />
              <Actions.EndCall />
            </Match>

            <Match when={myRole() === 'participant' && callStatus() === 'awaiting-response'}>
              <Actions.AcceptCall />
              <Actions.DeclineCall />
            </Match>

            <Match when={callStatus() === 'in-progress'}>
              <Actions.AudioToggle />
              <Actions.VideoToggle />
              <Actions.EndCall />
            </Match>
          </Switch>
        </ButtonGroup>
      </CardFooter>
    </Card>
  )
}

function VideoView(props: { type: 'my-view' | 'them-view'; ref: HTMLVideoElement }) {
  const isMyView = props.type === 'my-view'

  const { data: isCallEstablished } = useQuery(api.activeCall.isCallEstablished, {})
  const { data: myAudio } = useQuery(api.activeCall.myAudio, {}, { keepPreviousData: true, enabled: isMyView })
  const { data: myVideo } = useQuery(api.activeCall.myVideo, {}, { keepPreviousData: true, enabled: isMyView })
  const { data: theirAudio } = useQuery(api.activeCall.theirAudio, {}, { keepPreviousData: true, enabled: !isMyView })
  const { data: theirVideo } = useQuery(api.activeCall.theirVideo, {}, { keepPreviousData: true, enabled: !isMyView })

  const audio = createMemo(() => (props.type === 'my-view' ? myAudio() : theirAudio()))
  const video = createMemo(() => (props.type === 'my-view' ? myVideo() : theirVideo()))

  return (
    <div
      class="group/video relative size-full aspect-video"
      data-whos={props.type}
      data-audio={typeof audio() === 'boolean' ? audio() : 'none'}
      data-video={typeof video() === 'boolean' ? video() : 'none'}
      data-call-established={isCallEstablished()}
    >
      <video
        autoplay
        playsinline
        muted={props.type === 'my-view'}
        ref={props.ref}
        class="border size-full object-cover"
      />

      <NoVideoView
        type={props.type}
        class="absolute top-0 left-0 opacity-100 group-data-[video=true]/video:opacity-0"
      />

      <Button
        variant="outline"
        size="icon-xs"
        class="absolute bottom-1 right-1 v-destructive pointer-events-none group-data-[audio=true]/video:opacity-0 group-data-[audio=false]/video:opacity-100 group-data-[audio=none]/video:hidden group-data-[whos=them-view]/video:top-2 group-data-[whos=them-view]/video:left-2 group-data-[call-established=false]/video:opacity-0"
      >
        <MicOffIcon class="size-4" />
      </Button>
    </div>
  )
}

function NoVideoView(props: ComponentProps<'div'> & ParentProps<{ type: 'my-view' | 'them-view' }>) {
  const [local, rest] = splitProps(props, ['type', 'class'])
  const currentUser = useCurrentUser()
  const { data: callStatus } = useQuery(api.activeCall.status, {})
  const { data: myRole } = useQuery(api.activeCall.myRole, {})
  const { data: theirUser } = useQuery(api.activeCall.findTheirUser, {})
  const user = createMemo(() => (props.type === 'my-view' ? currentUser() : theirUser()))

  return (
    <div
      class={cn(
        '@container bg-card border-white border size-full flex items-center justify-center flex-col gap-2',
        local.class,
      )}
      {...rest}
    >
      <Show when={user()}>
        {(u) => (
          <Avatar
            variant="on-call"
            user={u()}
            class={cn(
              callStatus() === 'awaiting-response' && 'animate-bounce repeat-infinite',
              local.type === 'my-view' && 'size-[clamp(1.5rem,20cqi,3rem)]!',
            )}
          >
            <AvatarImage />
            <AvatarFallback />
          </Avatar>
        )}
      </Show>

      <span
        class={cn(
          'flex items-center justify-center gap-1 tracking-wide',
          local.type === 'my-view' && 'font-light text-[clamp(0.625rem,8cqi,4rem)]',
        )}
      >
        <Show when={callStatus() === 'awaiting-response' && myRole() === 'host' && props.type !== 'my-view'}>
          <span>Calling</span>
        </Show>

        <Show when={user()}>{(u) => <span>{u().fullname}</span>}</Show>

        <Show when={callStatus() === 'awaiting-response' && myRole() === 'participant'}>
          <span>is calling</span>
        </Show>
      </span>
    </div>
  )
}

const Actions = {
  StartAudioCall() {
    const { rtc } = useGlobalState()
    const startCall = useMutation(api.activeCall.start)
    return (
      <AudioButton label="Start Call" class="v-tertiary">
        <Button
          variant="outline"
          animate="scale-icon"
          disabled={rtc.audioPermissions() === 'denied'}
          onClick={async () => {
            await rtc.checkAudioPermissions()
            await startCall.mutate({ audio: false, video: false })
            SOUNDS.dial.play()
          }}
        >
          <PhoneIcon />
        </Button>
      </AudioButton>
    )
  },
  StartVideoCall() {
    const { rtc } = useGlobalState()
    const startCall = useMutation(api.activeCall.start)
    return (
      <VideoButton label="Start Video" class="v-tertiary">
        <Button
          variant="outline"
          animate="scale-icon"
          disabled={rtc.videoPermissions() === 'denied'}
          onClick={async () => {
            await rtc.checkVideoPermissions()
            await startCall.mutate({ audio: false, video: false })
            SOUNDS.dial.play()
          }}
        >
          <VideoIcon />
        </Button>
      </VideoButton>
    )
  },
  AudioToggle() {
    const { rtc } = useGlobalState()
    const { data: myAudio } = useQuery(api.activeCall.myAudio, {})
    const toggleAudio = useMutation(api.activeCall.toggleAudio)
    return (
      <AudioButton label={myAudio() ? 'Mute' : 'Unmute'} class="v-tertiary">
        <Toggle
          variant="outline"
          pressed={myAudio() ?? false}
          onPressedChange={async (pressed) => {
            const audioEnabled = await rtc.toggleAudio(pressed)
            await toggleAudio.mutate({ audio: audioEnabled })
          }}
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
          <Button
            variant="outline"
            animate="scale-icon"
            class="v-muted"
            onClick={() => {
              cancelCall.mutate({})
            }}
          >
            <XIcon />
          </Button>
        </ButtonGroup>
        <ButtonGroupText>Cancel</ButtonGroupText>
      </ButtonGroupWrapper>
    )
  },
}
