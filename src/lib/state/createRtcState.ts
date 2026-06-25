import { api } from '@/convex/api'
import { makePersisted } from '@solid-primitives/storage'
import { useMutation } from 'convex-solidjs'
import { createMemo, createResource, createSignal, onCleanup, onMount } from 'solid-js'
import { createStore } from 'solid-js/store'
import { HAVE_AUDIO_OUTPUT_SELECTOR } from '../constants'
import { getLSKey } from '../utils'

type GroupedDevices = Record<MediaDeviceInfo['kind'], MediaDeviceInfo[]>
type OptionalDevice = { deviceId?: string; device?: never } | { deviceId?: never; device?: MediaDeviceInfo }

export type RtcState = ReturnType<typeof createRtcState>
export function createRtcState() {
  let myStream = new MediaStream()
  let themStream = new MediaStream()
  let peerConnection = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] })
  const pendingCandidates: RTCIceCandidateInit[] = []

  const sendRtcMessage = useMutation(api.activeCall.sendRtcMessage)

  const [myVideoRef, setMyVideoRefInternal] = createSignal<HTMLVideoElement>()
  const [remoteVideoRef, setRemoteVideoRefInternal] = createSignal<HTMLVideoElement>()

  const [audioPermissions, audioAction] = createResource(async () => {
    if (!navigator.permissions.query) {
      console.warn('Navigator permissions not supported')
      return 'unknown'
    }

    try {
      const status = await navigator.permissions.query({ name: 'microphone' })
      status.onchange = async (e) => {
        audioAction.mutate((e.target as PermissionStatus).state)
        await refetchDevices()
      }
      return status.state
    } catch {
      console.warn('Failed to query microphone permission')
      return 'unknown'
    }
  })
  const [videoPermissions, videoAction] = createResource(async () => {
    if (!navigator.permissions.query) {
      console.warn('Navigator permissions not supported')
      return 'unknown'
    }

    try {
      const status = await navigator.permissions.query({ name: 'camera' })
      status.onchange = async (e) => {
        videoAction.mutate((e.target as PermissionStatus).state)
        await refetchDevices()
      }
      return status.state
    } catch {
      console.warn('Failed to query camera permission')
      return 'unknown'
    }
  })

  const [devices, { refetch: refetchDevices }] = createResource(async () => {
    const devices = await navigator.mediaDevices.enumerateDevices()
    return devices.reduce(
      (acc, device) => {
        acc.all.push(device)
        acc.byId[device.deviceId] = device
        acc.allGrouped[device.kind].push(device)

        if (device.deviceId === 'default' || device.label.startsWith('Default - ')) return acc
        acc.dropdown[device.kind].push(device)
        return acc
      },
      {
        all: [] as MediaDeviceInfo[],
        byId: {} as Record<string, MediaDeviceInfo | undefined>,
        allGrouped: { audioinput: [], audiooutput: [], videoinput: [] } as GroupedDevices,
        dropdown: { audioinput: [], audiooutput: [], videoinput: [] } as GroupedDevices,
      },
    )
  })

  const [selectedDevices, setSelectedDevices] = makePersisted(
    createStore<Record<MediaDeviceInfo['kind'], MediaDeviceInfo | undefined>>({
      audioinput: undefined,
      audiooutput: undefined,
      videoinput: undefined,
    }),
    { name: getLSKey('selected-media-devices') },
  )

  function setMyVideoRef(el: HTMLVideoElement) {
    initRtc(el)
  }

  /**
   * This function is supposed to find the actual device that is used. Some browser implementation
   * of `enumerateDevices()` might return the same device twice:
   *   - with _`deviceId`_ set to _`"default"`_
   *   - or with the label starting with _`"Default - "`_
   *   - or both simultaneously
   */
  function getUnambiguousSelectedDevice(kind: MediaDeviceInfo['kind']) {
    if (selectedDevices[kind]) {
      const storedDevice = findDevice(selectedDevices[kind])
      /* If I found the actual device store, then just return it  */
      if (storedDevice) return storedDevice
    }

    const list = devices.latest?.allGrouped[kind] ?? []
    const browserDefaultDevice = list.find((d) => d.deviceId === 'device' || d.label.startsWith('Default - '))
    const actualLabel = browserDefaultDevice?.label.replace('Default - ', '')
    const actualDevice = list.find((d) => d.label === actualLabel)
    return actualDevice ?? list[0] ?? ({ deviceId: '' } as MediaDeviceInfo)
  }

  const selectedAudioInputDevice = createMemo<MediaDeviceInfo>(() => getUnambiguousSelectedDevice('audioinput'))
  const selectedAudioOutputDevice = createMemo<MediaDeviceInfo>(() => getUnambiguousSelectedDevice('audiooutput'))
  const selectedVideoInputDevice = createMemo<MediaDeviceInfo>(() => getUnambiguousSelectedDevice('videoinput'))

  function findDeviceById(deviceId: string | undefined) {
    if (!deviceId) {
      console.warn(`findDeviceById: deviceId is undefined`)
      return undefined
    }

    if (!devices.latest) {
      console.warn(`findDeviceById: enumerateDevices() was not called yet.`)
      return undefined
    }

    const list = devices.latest.all
    if (list.length === 0) {
      console.warn(`findDeviceById: no devices returned from enumerateDevices()`)
      return undefined
    }

    return list.find((d) => d.deviceId === deviceId)
  }

  function findDevice(device: MediaDeviceInfo | undefined) {
    if (device == null) {
      console.warn(`findDevice: provided device is undefined`)
      return undefined
    }

    if (!devices.latest) {
      console.warn(`findDevice: enumerateDevices() was not called yet.`)
      return undefined
    }

    if (devices.latest.all.length === 0) {
      console.warn(`findDevice: no devices returned from enumerateDevices() for ${device.kind}`)
      return undefined
    }

    if (devices.latest.byId[device.deviceId] == null) {
      console.warn(`findDevice: device ID ${device.deviceId} not found in enumerateDevices()`)
      return undefined
    }

    return devices.latest.allGrouped[device.kind].find((d) => d.label === device.label)
  }

  async function getMediaConstraints(
    kind: Kind,
    deviceArgs: OptionalDevice = {},
  ): Promise<MediaTrackConstraints | true> {
    const deviceKind: MediaDeviceKind = kind === 'audio' ? 'audioinput' : 'videoinput'
    const stored = deviceArgs.device ?? findDeviceById(deviceArgs.deviceId) ?? selectedDevices[deviceKind]

    if (!stored) {
      console.warn(`No stored ${deviceKind} found`)
      return true
    }

    const device = findDevice(stored) ?? devices.latest?.dropdown[deviceKind][0]!
    return { deviceId: { exact: device.deviceId } }
  }

  /** @throws */
  async function requestNewStream(
    args:
      | ({ kind: 'audio' | 'video' } & OptionalDevice)
      | { kind: 'both'; audio?: OptionalDevice; video?: OptionalDevice },
  ) {
    try {
      const videoConstraints = await getMediaConstraints('video', args.kind === 'both' ? args.video : args)
      const audioConstraints = await getMediaConstraints('audio', args.kind === 'both' ? args.audio : args)
      const stream = await navigator.mediaDevices.getUserMedia({
        video: args.kind === 'video' || args.kind === 'both' ? videoConstraints : false,
        audio: args.kind === 'audio' || args.kind === 'both' ? audioConstraints : false,
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
    S = T extends 'both' ? { audio?: OptionalDevice; video?: OptionalDevice } : OptionalDevice,
    R = T extends 'both' ? { audio: MediaStreamTrack; video: MediaStreamTrack } : MediaStreamTrack,
  >(kind: T, deviceArgs?: S): Promise<R> {
    const stream = await requestNewStream({ kind, ...deviceArgs })
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

  async function checkAudioPermissions() {
    if (audioPermissions() === 'granted' || audioPermissions() === 'denied') return

    try {
      const audioStream = await requestNewStream({ kind: 'audio' })
      audioStream.getAudioTracks().forEach((track) => track.stop())
    } catch (error) {
      console.warn('Failed to request audio permissions', { error })
    }
  }

  async function checkVideoPermissions() {
    if (videoPermissions() === 'granted' || videoPermissions() === 'denied') return

    try {
      const videoStream = await requestNewStream({ kind: 'video' })
      videoStream.getVideoTracks().forEach((track) => track.stop())
    } catch (error) {
      console.warn('Failed to request video permissions', { error })
    }
  }

  function getTransceiver(kind: Kind) {
    const transceiver = peerConnection
      .getTransceivers()
      .find((t) => (t.sender.track?.kind ?? t.receiver.track.kind) === kind)
    return transceiver
  }

  /** @throws */
  async function setInputDevice(kind: Exclude<MediaDeviceInfo['kind'], 'audiooutput'>, deviceId: string) {
    const isAudio = kind === 'audioinput'
    const trackKind: Kind = isAudio ? 'audio' : 'video'

    const newDevice = findDeviceById(deviceId)
    const storedDevice = findDevice(selectedDevices[kind])

    if (newDevice == null) throw new Error(`Device not found: ${deviceId}`)

    /* Ignore if the device is already selected and it's the same device that was stored */
    if (storedDevice && storedDevice.label === newDevice.label && storedDevice.deviceId === newDevice.deviceId) {
      return
    }

    const newTrack = await requestNewTrack(trackKind)
    const [oldTrack] = isAudio ? myStream.getAudioTracks() : myStream.getVideoTracks()

    const transceiver = getTransceiver(trackKind)
    if (!transceiver) throw new Error(`No transceiver found for ${trackKind}`)

    await transceiver.sender.replaceTrack(newTrack)

    if (oldTrack) {
      myStream.removeTrack(oldTrack)
      oldTrack.stop()
    }

    myStream.addTrack(newTrack)
    setSelectedDevices(kind, newDevice.toJSON())
  }

  /** @throws */
  async function setOutputDevice(deviceId: string) {
    /* Ignore if browser does not support audio output selection */
    if (HAVE_AUDIO_OUTPUT_SELECTOR === false) return

    const newDevice = findDeviceById(deviceId)
    const storedDevice = findDevice(selectedDevices.audiooutput)

    if (newDevice == null) throw new Error(`Device not found: ${deviceId}`)

    /* Ignore if the device is already selected and it's the same device that was stored */
    if (storedDevice && storedDevice.label === newDevice.label && storedDevice.deviceId === newDevice.deviceId) {
      return
    }

    await remoteVideoRef()?.setSinkId(newDevice.deviceId)
    setSelectedDevices('audiooutput', newDevice.toJSON())
  }

  async function updateSelectedDeviceValue(kind: MediaDeviceInfo['kind'], deviceId: string) {
    const device = devices.latest?.byId[deviceId]
    if (!device) {
      console.warn(`Device not found: ${deviceId}`)
      return
    }

    setSelectedDevices(kind, device.toJSON())
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
        myStream.addTrack(track)
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
        myStream.removeTrack(existingTrack)
        existingTrack.stop()
      }
    } catch (error) {
      console.warn(`Failed to toggle video`, { error })
    }
  }

  /** @throws */
  async function createOffer() {
    peerConnection.addTransceiver('audio', { direction: 'sendrecv' })
    peerConnection.addTransceiver('video', { direction: 'sendrecv' })

    const offer = await peerConnection.createOffer()
    await peerConnection.setLocalDescription(offer)
    return offer
  }

  /** @throws */
  async function createAnswer(offer: RTCSessionDescriptionInit) {
    await peerConnection.setRemoteDescription(offer)

    const audioTransceiver = getTransceiver('audio')
    const videoTransceiver = getTransceiver('video')
    if (!audioTransceiver) throw new Error('No audio transceiver found')
    if (!videoTransceiver) throw new Error('No video transceiver found')

    audioTransceiver.direction = 'sendrecv'
    videoTransceiver.direction = 'sendrecv'

    const answer = await peerConnection.createAnswer()
    await peerConnection.setLocalDescription(answer)
    return answer
  }

  async function addPendingCandidates() {
    try {
      for (const candidate of pendingCandidates) {
        await peerConnection.addIceCandidate(candidate)
      }
      pendingCandidates.length = 0
    } catch (error) {
      console.warn('Failed to add pending candidates', { error })
    }
  }

  async function queueCandidate(candidate: RTCIceCandidateInit) {
    if (peerConnection.remoteDescription) {
      await peerConnection.addIceCandidate(candidate)
    } else {
      pendingCandidates.push(candidate)
    }
  }

  async function receiveAnswer(answer: RTCSessionDescriptionInit) {
    await peerConnection.setRemoteDescription(answer)
    await addPendingCandidates()
  }

  /** @throws */
  async function attachAudioOutput(remoteRef: HTMLVideoElement) {
    /* Ignore if browser does not support audio output selection */
    if (HAVE_AUDIO_OUTPUT_SELECTOR === false) return

    const device = findDevice(selectedDevices.audiooutput) ?? devices()?.allGrouped.audiooutput[0]
    if (!device) throw new Error('No audio output device found')
    await remoteRef.setSinkId(device.deviceId)
  }

  async function setRemoteVideoRef(ref: HTMLVideoElement) {
    setRemoteVideoRefInternal(ref)
    attachAudioOutput(ref)

    themStream = new MediaStream()
    ref.srcObject = themStream
  }

  function initRtc(el: HTMLVideoElement) {
    peerConnection = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] })

    myStream = new MediaStream()
    el.srcObject = myStream

    peerConnection.ontrack = async (e) => {
      themStream.addTrack(e.track)
    }

    peerConnection.onicecandidate = (event) => {
      const candidate = event.candidate?.toJSON()
      if (candidate) {
        sendRtcMessage.mutate({ message: { type: 'ice-candidate', data: candidate } })
      }
    }

    setMyVideoRefInternal(el)
    navigator.mediaDevices.addEventListener('devicechange', refetchDevices)
  }

  function cleanup() {
    if (peerConnection.connectionState === 'closed') return

    for (const transceiver of peerConnection.getTransceivers()) {
      transceiver.sender.track?.stop()
      transceiver.stop()
    }

    for (const track of myStream.getTracks()) {
      track.stop()
      myStream.removeTrack(track)
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

    pendingCandidates.length = 0
    peerConnection.close()
    navigator.mediaDevices.removeEventListener('devicechange', refetchDevices)
    setMyVideoRefInternal(undefined)
    setRemoteVideoRefInternal(undefined)
  }

  onCleanup(() => cleanup())

  return {
    devices,
    toggleAudio,
    toggleVideo,
    setDevice,
    createOffer,
    createAnswer,
    receiveAnswer,
    addPendingCandidates,
    queueCandidate,
    setMyVideoRef,
    setRemoteVideoRef,
    selectedAudioInputDevice,
    selectedAudioOutputDevice,
    selectedVideoInputDevice,
    updateSelectedDeviceValue,
    audioPermissions,
    videoPermissions,
    checkAudioPermissions,
    checkVideoPermissions,
    cleanup,
  }
}
