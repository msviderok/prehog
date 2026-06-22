import { api } from '@/convex/api'
import { makePersisted } from '@solid-primitives/storage'
import { useMutation } from 'convex-solidjs'
import { createResource, createSignal, onCleanup, onMount } from 'solid-js'
import { createStore, produce } from 'solid-js/store'
import { getLSKey } from '../utils'
import { HAVE_AUDIO_OUTPUT_SELECTOR } from '../constants'

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
        if (defaultDevices.has(device.deviceId)) {
          acc[device.kind].unshift(device)
        } else {
          acc[device.kind].push(device)
        }
        return acc
      },
      {
        audioinput: [],
        audiooutput: [],
        videoinput: [],
      } as Record<MediaDeviceInfo['kind'], MediaDeviceInfo[]>,
    )
}

export type RtcState = ReturnType<typeof createRtcState>
export function createRtcState() {
  const themStream = new MediaStream()
  const sendRtcMessage = useMutation(api.activeCall.sendRtcMessage)

  const [myVideoRef, setMyVideoRef] = createSignal<HTMLVideoElement>()
  const [remoteVideoRef, setRemoteVideoRefInternal] = createSignal<HTMLVideoElement>()
  const [devices, devicesAction] = createResource(listDevices)
  const [selectedDevices, setSelectedDevices] = makePersisted(
    createStore<Record<MediaDeviceInfo['kind'], string | undefined>>({
      audioinput: undefined,
      audiooutput: undefined,
      videoinput: undefined,
    }),
    { name: getLSKey('selected-media-devices') },
  )

  const myRTC = {
    ref: myVideoRef,
    setRef: setMyVideoRef,
    peer: new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] }),
    stream: new MediaStream(),
    pendingCandidates: [] as RTCIceCandidateInit[],
  }

  function getMediaConstraints(kind: Kind): MediaTrackConstraints | boolean {
    const deviceKind: MediaDeviceKind = kind === 'audio' ? 'audioinput' : 'videoinput'
    const storedDevice = devices()?.[deviceKind].find((d) => d.deviceId === selectedDevices[deviceKind])?.deviceId
    return storedDevice ? { deviceId: { exact: storedDevice } } : true
  }

  /** @throws */
  async function requestNewStream(kind: 'audio' | 'video' | 'both') {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: kind === 'video' || kind === 'both' ? getMediaConstraints('video') : false,
        audio: kind === 'audio' || kind === 'both' ? getMediaConstraints('audio') : false,
      })
      return stream
    } catch (error) {
      console.warn('Failed to request new stream', { error })
      throw error
    }
  }

  /** @throws */
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
    try {
      const audioStream = await requestNewStream('audio')
      audioStream.getAudioTracks().forEach((track) => track.stop())
    } catch (error) {
      console.warn('Failed to request audio permissions', { error })
    }
  }

  async function requestVideoPermissions() {
    try {
      const videoStream = await requestNewStream('video')
      videoStream.getVideoTracks().forEach((track) => track.stop())
    } catch (error) {
      console.warn('Failed to request video permissions', { error })
    }
  }

  async function refetchDevices(kind: Kind) {
    try {
      if (kind === 'audio') await requestAudioPermissions()
      else await requestVideoPermissions()

      await devicesAction.refetch()
      setSelectedDevices(
        produce((state) => {
          state.audioinput ??= devices()?.audioinput[0]?.deviceId
          state.audiooutput ??= devices()?.audiooutput[0]?.deviceId
          state.videoinput ??= devices()?.videoinput[0]?.deviceId
        }),
      )
    } catch (error) {
      console.warn('Failed to refetch devices', { error })
    }
  }

  function getTransceiver(kind: Kind) {
    const transceiver = myRTC.peer
      .getTransceivers()
      .find((t) => (t.sender.track?.kind ?? t.receiver.track.kind) === kind)
    return transceiver
  }

  /** @throws */
  async function setInputDevice(kind: Exclude<MediaDeviceInfo['kind'], 'audiooutput'>, deviceId: string) {
    const isAudio = kind === 'audioinput'
    const trackKind: Kind = isAudio ? 'audio' : 'video'

    /* Ignore if the device is already selected */
    if (deviceId === selectedDevices[kind]) return

    const newTrack = await requestNewTrack(trackKind)
    const [oldTrack] = isAudio ? myRTC.stream.getAudioTracks() : myRTC.stream.getVideoTracks()

    const transceiver = getTransceiver(trackKind)
    if (!transceiver) throw new Error(`No transceiver found for ${trackKind}`)

    await transceiver.sender.replaceTrack(newTrack)

    if (oldTrack) {
      myRTC.stream.removeTrack(oldTrack)
      oldTrack.stop()
    }

    myRTC.stream.addTrack(newTrack)
    setSelectedDevices(kind, deviceId)
  }

  /** @throws */
  async function setOutputDevice(deviceId: string) {
    /* Ignore if browser does not support audio output selection */
    if (HAVE_AUDIO_OUTPUT_SELECTOR === false) return
    /* Ignore if the device is already selected */
    if (deviceId === selectedDevices['audiooutput']) return

    await remoteVideoRef()?.setSinkId(deviceId)
    setSelectedDevices('audiooutput', deviceId)
  }

  async function setDevice(kind: MediaDeviceInfo['kind'], deviceId: string) {
    try {
      if (kind === 'audiooutput') {
        await setOutputDevice(deviceId)
      } else {
        await setInputDevice(kind, deviceId)
      }
    } catch (error) {
      console.warn(`Failed to set device ${deviceId} for kind ${kind}`, { kind, deviceId, error })
    }
  }

  async function toggleAudio(enabled: boolean) {
    try {
      const transceiver = getTransceiver('audio')
      if (!transceiver) {
        throw new Error(`Audio toggle should not be called before the offer/answer is created and set on both sides`)
      }

      const existingTrack = transceiver.sender.track
      if (existingTrack) {
        existingTrack.enabled = enabled
        return
      }

      if (!enabled) return

      const track = await requestNewTrack('audio')
      await transceiver.sender.replaceTrack(track)
      track.enabled = enabled

      /**
       * Contrary to the video toggle, we don't need to add our audio to our local stream
       * as we won't need to hear ourselves.
       */
    } catch (error) {
      console.warn(`Failed to toggle audio`, { error })
    }
  }

  async function toggleVideo(enabled: boolean) {
    try {
      const transceiver = getTransceiver('video')
      if (!transceiver) {
        throw new Error(`Video toggle should not be called before the offer/answer is created and set on both sides`)
      }

      const existingTrack = transceiver.sender.track

      if (enabled) {
        /**
         * If for some reason there already exists a video track – we should not add a new one.
         * Otherwise, adding a new track could still leak the old one. This should not be possible though.
         */
        if (existingTrack) {
          existingTrack.enabled = true
          return
        }

        /* Enabling the video should always create a new video track */
        const track = await requestNewTrack('video')
        await transceiver.sender.replaceTrack(track)
        /* We need to add video track to our local stream so we can see our own video */
        myRTC.stream.addTrack(track)
        track.enabled = true
        return
      }

      /**
       * Disabling the video should always release the video device.
       * This is the main difference between audio and video toggles.
       */
      await transceiver.sender.replaceTrack(null)

      if (existingTrack) {
        existingTrack.enabled = false
        myRTC.stream.removeTrack(existingTrack)
        existingTrack.stop()
      }
    } catch (error) {
      console.warn(`Failed to toggle video`, { error })
    }
  }

  /** @throws */
  async function createOffer() {
    myRTC.peer.addTransceiver('audio', { direction: 'sendrecv' })
    myRTC.peer.addTransceiver('video', { direction: 'sendrecv' })

    const offer = await myRTC.peer.createOffer()
    await myRTC.peer.setLocalDescription(offer)
    return offer
  }

  /** @throws */
  async function createAnswer(offer: RTCSessionDescriptionInit) {
    await myRTC.peer.setRemoteDescription(offer)

    const audioTransceiver = getTransceiver('audio')
    const videoTransceiver = getTransceiver('video')
    if (!audioTransceiver) throw new Error('No audio transceiver found')
    if (!videoTransceiver) throw new Error('No video transceiver found')

    audioTransceiver.direction = 'sendrecv'
    videoTransceiver.direction = 'sendrecv'

    const answer = await myRTC.peer.createAnswer()
    await myRTC.peer.setLocalDescription(answer)
    return answer
  }

  async function addPendingCandidates() {
    try {
      for (const candidate of myRTC.pendingCandidates) {
        await myRTC.peer.addIceCandidate(candidate)
      }
      myRTC.pendingCandidates.length = 0
    } catch (error) {
      console.warn('Failed to add pending candidates', { error })
    }
  }

  /** @throws */
  async function attachAudioOutput(remoteRef: HTMLVideoElement) {
    /* Ignore if browser does not support audio output selection */
    if (HAVE_AUDIO_OUTPUT_SELECTOR === false) return

    const outputs = devices()?.audiooutput ?? []
    const device = selectedDevices.audiooutput
      ? (outputs.find((i) => i.deviceId === selectedDevices.audiooutput) ?? outputs[0])
      : outputs[0]

    if (!device) throw new Error('No audio output device found')
    await remoteRef.setSinkId(device.deviceId)
  }

  async function setRemoteVideoRef(ref: HTMLVideoElement) {
    ref.srcObject = themStream
    setRemoteVideoRefInternal(ref)
    attachAudioOutput(ref)
  }

  onMount(() => {
    myRTC.peer.ontrack = (e) => {
      themStream.addTrack(e.track)
    }

    myRTC.peer.onicecandidate = (event) => {
      const candidate = event.candidate?.toJSON()
      if (candidate) {
        sendRtcMessage.mutate({ message: { type: 'ice-candidate', data: candidate } })
      }
    }
  })

  onCleanup(() => {
    for (const sender of myRTC.peer.getSenders()) {
      sender.track?.stop()
    }

    for (const track of myRTC.stream.getTracks()) {
      track.stop()
      myRTC.stream.removeTrack(track)
    }

    for (const track of themStream.getTracks()) {
      track.stop()
      themStream.removeTrack(track)
    }

    const myRef = myVideoRef()
    if (myRef) {
      myRef.pause()
      myRef.srcObject = null
    }

    const themRef = remoteVideoRef()
    if (themRef) {
      themRef.pause()
      themRef.srcObject = null
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
    remoteVideoRef,
    setRemoteVideoRef,
    requestNewStream,
    selectedDevices,
  }
}
