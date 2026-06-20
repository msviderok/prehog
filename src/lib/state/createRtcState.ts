import { api } from '@/convex/api'
import { makePersisted } from '@solid-primitives/storage'
import { useMutation } from 'convex-solidjs'
import { createResource, createSignal, onCleanup, onMount, type Accessor, type Setter } from 'solid-js'
import { createStore, produce, type SetStoreFunction, type Store } from 'solid-js/store'
import { getLSKey } from '../utils'

type Kind = 'audio' | 'video'

type SingleRtcState = {
  ref: Accessor<HTMLVideoElement | undefined>
  setRef: Setter<HTMLVideoElement | undefined>
  peer: RTCPeerConnection
  stream: MediaStream
  tracks: {
    audio: MediaStreamTrack | undefined
    video: MediaStreamTrack | undefined
  }
  selectedDevices: Store<Record<MediaDeviceInfo['kind'], string | undefined>>
  setSelectedDevices: SetStoreFunction<Record<MediaDeviceInfo['kind'], string | undefined>>
  pendingCandidates: RTCIceCandidateInit[]
}

async function listDevices() {
  const devices = await navigator.mediaDevices.enumerateDevices()
  const defaultDevices = new Set<string>()
  return devices
    .map((device) => {
      if (device.deviceId === 'default') {
        const label = device.label.replace('Default - ', '')
        const actualDevice = devices.find(
          (d) => d.label === label && d.kind === device.kind && d.groupId === device.groupId,
        )

        if (actualDevice) {
          defaultDevices.add(actualDevice.deviceId)
        }
      }
      return device
    })
    .filter((d) => d.deviceId !== 'default')
    .reduce(
      (acc, device) => {
        acc[device.kind].push({ device, default: defaultDevices.has(device.deviceId) })
        return acc
      },
      {
        audioinput: [],
        audiooutput: [],
        videoinput: [],
      } as Record<MediaDeviceInfo['kind'], Array<{ device: MediaDeviceInfo; default: boolean }>>,
    )
}

function createInitState(): SingleRtcState {
  const [ref, setRef] = createSignal<HTMLVideoElement | undefined>(undefined)
  const [selectedDevices, setSelectedDevices] = makePersisted(
    createStore<Record<MediaDeviceInfo['kind'], string | undefined>>({
      audioinput: undefined,
      audiooutput: undefined,
      videoinput: undefined,
    }),
    { name: getLSKey('selected-media-devices') },
  )

  return {
    ref,
    setRef,
    peer: new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] }),
    stream: new MediaStream(),
    selectedDevices,
    setSelectedDevices,
    pendingCandidates: [],
    tracks: {
      audio: undefined as MediaStreamTrack | undefined,
      video: undefined as MediaStreamTrack | undefined,
    },
  }
}

export type RtcState = ReturnType<typeof createRtcState>
export function createRtcState() {
  const myRTC = createInitState()
  const [removeVideoRef, setRemoteVideoRef] = createSignal<HTMLVideoElement | undefined>(undefined)
  const [devices, { refetch: refetchListDevices }] = createResource(listDevices)
  const sendRtcMessage = useMutation(api.activeCall.sendRtcMessage)

  function getMediaConstraints(kind: Kind): MediaTrackConstraints | boolean {
    const deviceKind: MediaDeviceKind = kind === 'audio' ? 'audioinput' : 'videoinput'
    const storedDevice = myRTC.selectedDevices[deviceKind]
    return storedDevice ? { deviceId: { exact: storedDevice } } : true
  }

  async function requestNewStream(kind: 'audio' | 'video' | 'both') {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: kind === 'video' || kind === 'both' ? getMediaConstraints('video') : false,
      audio: kind === 'audio' || kind === 'both' ? getMediaConstraints('audio') : false,
    })
    return stream
  }

  async function requestNewTrack<
    T extends 'audio' | 'video' | 'both',
    R = T extends 'both' ? { audio: MediaStreamTrack; video: MediaStreamTrack } : MediaStreamTrack,
  >(kind: T): Promise<R> {
    const stream = await requestNewStream(kind)
    const [audioTrack] = stream.getAudioTracks()
    const [videoTrack] = stream.getVideoTracks()

    if (kind === 'audio') {
      if (audioTrack) return audioTrack as R
      throw new Error('No audio track returned')
    }

    if (kind === 'video') {
      if (videoTrack) return videoTrack as R
      throw new Error('No video track returned')
    }

    if (!audioTrack) throw new Error('No audio track returned')
    if (!videoTrack) throw new Error('No video track returned')
    return { audio: audioTrack, video: videoTrack } as R
  }

  async function requestAudioPermissions() {
    const audioStream = await requestNewStream('audio')
    audioStream.getAudioTracks().forEach((track) => track.stop())
  }

  async function requestVideoPermissions() {
    const videoStream = await requestNewStream('video')
    videoStream.getVideoTracks().forEach((track) => track.stop())
  }

  async function refetchDevices(kind: Kind) {
    if (kind === 'audio') await requestAudioPermissions()
    else await requestVideoPermissions()

    await refetchListDevices()
    myRTC.setSelectedDevices(
      produce((state) => {
        state.audioinput ??= devices()?.audioinput[0]?.device.deviceId
        state.audiooutput ??= devices()?.audiooutput[0]?.device.deviceId
        state.videoinput ??= devices()?.videoinput[0]?.device.deviceId
      }),
    )
  }

  async function setInputDevice(kind: Exclude<MediaDeviceInfo['kind'], 'audiooutput'>, deviceId: string) {
    const isAudio = kind === 'audioinput'
    const trackKind: Kind = isAudio ? 'audio' : 'video'
    const newTrack = await requestNewTrack(trackKind)

    const [oldTrack] = isAudio ? myRTC.stream.getAudioTracks() : myRTC.stream.getVideoTracks()

    const sender = myRTC.peer.getSenders().find((sender) => sender.track?.kind === trackKind)
    if (sender) {
      await sender.replaceTrack(newTrack)
      // newTrack.stop()
      // throw new Error(`No ${kind} sender found`)
    }

    if (oldTrack) {
      myRTC.stream.removeTrack(oldTrack)
      oldTrack.stop()
    }

    myRTC.stream.addTrack(newTrack)
    myRTC.tracks[trackKind] = newTrack
    myRTC.setSelectedDevices(kind, deviceId)
  }

  async function setOutputDevice(deviceId: string) {
    // myRTC.ref()?.setSinkId(deviceId)
    // themRTC.ref()?.setSinkId(deviceId)
    myRTC.setSelectedDevices('audiooutput', deviceId)
  }

  async function setDevice(kind: MediaDeviceInfo['kind'], deviceId: string) {
    if (kind === 'audiooutput') return setOutputDevice(deviceId)
    return setInputDevice(kind, deviceId)
  }

  async function toggleAudio(enabled: boolean) {
    if (myRTC.tracks.audio) {
      myRTC.tracks.audio.enabled = enabled
      return
    }

    if (enabled === false) return

    const track = await requestNewTrack('audio')
    myRTC.stream.addTrack(track)
    myRTC.tracks.audio = track
  }

  async function toggleVideo(enabled: boolean) {
    if (myRTC.tracks.video) {
      myRTC.tracks.video.enabled = enabled
      return
    }

    if (enabled === false) return

    const track = await requestNewTrack('video')
    myRTC.stream.addTrack(track)
    myRTC.tracks.video = track
  }

  async function createOffer() {
    const offer = await myRTC.peer.createOffer()
    await myRTC.peer.setLocalDescription(offer)
    return offer
  }

  async function createAnswer() {
    const answer = await myRTC.peer.createAnswer()
    await myRTC.peer.setLocalDescription(answer)
    return answer
  }

  async function addPendingCandidates() {
    for (const candidate of myRTC.pendingCandidates) {
      await myRTC.peer.addIceCandidate(candidate)
    }
    myRTC.pendingCandidates.length = 0
  }

  async function attachMyMic() {
    const track = await requestNewTrack('audio')
    myRTC.peer
      .getTransceivers()
      .find((t) => (t.sender.track?.kind ?? t.receiver.track.kind) === 'audio')
      ?.sender.replaceTrack(track)
  }

  async function attachMyVideo() {
    const track = await requestNewTrack('video')
    myRTC.peer
      .getTransceivers()
      .find((t) => (t.sender.track?.kind ?? t.receiver.track.kind) === 'video')
      ?.sender.replaceTrack(track)
  }

  async function attachBothAudioVideo() {
    const { audio, video } = await requestNewTrack('both')
    const audioTransceiver = myRTC.peer
      .getTransceivers()
      .find((t) => (t.sender.track?.kind ?? t.receiver.track.kind) === 'audio')
    console.log(audioTransceiver, audio)
    const videoTransceiver = myRTC.peer
      .getTransceivers()
      .find((t) => (t.sender.track?.kind ?? t.receiver.track.kind) === 'video')

    audioTransceiver?.sender.replaceTrack(audio)
    videoTransceiver?.sender.replaceTrack(video)
  }

  onMount(() => {
    console.log(myRTC.peer)

    myRTC.peer.ontrack = (e) => {
      console.log('on track', e.streams)
      const remoteRef = removeVideoRef()
      if (remoteRef) {
        // remoteRef.srcObject = e.streams[0]
      }
    }

    myRTC.peer.onicecandidate = (event) => {
      const candidate = event.candidate?.toJSON()
      if (candidate) {
        sendRtcMessage.mutate({ message: { type: 'ice-candidate', data: candidate } })
      }
    }
  })

  onCleanup(() => {
    for (const track of myRTC.stream.getTracks()) {
      track.stop()
      myRTC.stream.removeTrack(track)
    }

    for (const sender of myRTC.peer.getSenders()) {
      if (sender.track) {
        myRTC.peer.removeTrack(sender)
      }
    }

    const ref = myRTC.ref()
    if (ref) {
      ref.pause()
      ref.srcObject = null
    }

    myRTC.peer.close()
  })

  return {
    requestAudioPermissions,
    requestVideoPermissions,
    myRTC,
    devices,
    refetchDevices,
    toggleAudio,
    toggleVideo,
    setDevice,
    createOffer,
    createAnswer,
    addPendingCandidates,
    removeVideoRef,
    setRemoteVideoRef,
    requestNewStream,
    attachMyMic,
    attachMyVideo,
    attachBothAudioVideo,
  }
}
