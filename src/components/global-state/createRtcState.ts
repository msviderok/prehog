import { api } from '@/convex/api'
import { useMutation } from 'convex-solidjs'
import { createSignal, onCleanup } from 'solid-js'
import { HAVE_AUDIO_OUTPUT_SELECTOR } from '../../lib/constants'
import { createMediaDevices } from '../../lib/createMediaDevices'

type OptionalDevice = { deviceId: string; device?: never } | { deviceId?: never; device: MediaDeviceInfo }

export type RtcState = ReturnType<typeof createRtcState>
export function createRtcState() {
  let myStream = new MediaStream()
  let themStream = new MediaStream()
  let peerConnection = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] })
  const pendingCandidates: RTCIceCandidateInit[] = []

  const sendRtcMessage = useMutation(api.activeCall.sendRtcMessage)

  const [myRef, setMyRef] = createSignal<HTMLVideoElement | undefined>()
  const [remoteRef, setRemoteRef] = createSignal<HTMLVideoElement | undefined>()

  const mediaDevices = createMediaDevices()
  const {
    devices,
    selectedDevices,
    setSelectedDevices,
    refetchDevices,
    needToCheckAudioPermissions,
    needToCheckVideoPermissions,
    hasEmptyAudioDevices,
    hasEmptyVideoDevices,
  } = mediaDevices

  async function initRtc(myEl: HTMLVideoElement, remoteEl: HTMLVideoElement) {
    cleanup()

    setMyRef(myEl)
    setRemoteRef(remoteEl)

    myStream = new MediaStream()
    themStream = new MediaStream()
    myEl.srcObject = myStream
    remoteEl.srcObject = themStream

    peerConnection = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] })
    peerConnection.ontrack = async (e) => {
      themStream.addTrack(e.track)

      try {
        await setOutputDevice(remoteEl)
      } catch (error) {
        console.warn('remote element play failed', error)
      }
    }

    peerConnection.onicecandidate = (event) => {
      const candidate = event.candidate?.toJSON()
      if (candidate) {
        sendRtcMessage.mutate({ message: { type: 'ice-candidate', data: candidate } })
      }
    }

    navigator.mediaDevices.addEventListener('devicechange', refetchDevices)
  }

  function cleanup() {
    pendingCandidates.length = 0
    navigator.mediaDevices.removeEventListener('devicechange', refetchDevices)

    /* Pause and clean up my video ref; stop and remove all the tracks from my stream. */
    if (myRef()) {
      myRef()!.pause()
      myRef()!.srcObject = null
      setMyRef(undefined)
    }
    for (const track of myStream.getTracks()) {
      track.stop()
      myStream.removeTrack(track)
    }

    for (const track of themStream.getTracks()) {
      track.stop()
      themStream.removeTrack(track)
    }

    if (remoteRef()) {
      remoteRef()!.pause()
      remoteRef()!.srcObject = null
      setRemoteRef(undefined)
    }

    if (peerConnection.connectionState !== 'closed') {
      for (const transceiver of peerConnection.getTransceivers()) {
        transceiver.sender.track?.stop()
        transceiver.stop()
      }

      peerConnection.close()
    }
  }

  async function confirmConnectionEstablished() {
    await toggleAudio(true)
  }

  function findDeviceById(deviceId: string | undefined) {
    if (!deviceId) {
      console.warn(`findDeviceById: deviceId is undefined`)
      return undefined
    }

    if (devices().all.length === 0) {
      console.warn(`findDeviceById: no devices returned from enumerateDevices()`)
      return undefined
    }

    return devices().all.find((d) => d.deviceId === deviceId)
  }

  function findDevice(device: MediaDeviceInfo | undefined) {
    if (device == null) {
      console.warn(`findDevice: provided device is undefined`)
      return undefined
    }

    if (devices().all.length === 0) {
      console.warn(`findDevice: no devices returned from enumerateDevices() for ${device.kind}`)
      return undefined
    }

    const existsById = devices().all.find((d) => d.deviceId === device.deviceId)
    if (existsById == null) {
      console.warn(`findDevice: device ID ${device.deviceId} not found in enumerateDevices()`)
      return undefined
    }

    return devices().all.find((d) => d.kind === device.kind && d.label === device.label)
  }

  async function getMediaConstraints(
    kind: Kind,
    deviceArgs: OptionalDevice | 'default',
  ): Promise<MediaTrackConstraints | true> {
    const deviceKind: MediaDeviceKind = kind === 'audio' ? 'audioinput' : 'videoinput'

    if (deviceArgs === 'default') {
      const device = findDevice(selectedDevices[deviceKind]) ?? devices().dropdown[deviceKind][0]!
      if (device.deviceId === '' || device.label === '') {
        console.warn(`Device ${deviceKind} has empty deviceId or label`, { deviceArgs })
        return true
      }
      return { deviceId: { exact: device.deviceId } }
    }

    const deviceToFind = findDevice(deviceArgs.device) ?? findDeviceById(deviceArgs.deviceId)
    if (deviceToFind) return deviceToFind

    const device = findDevice(selectedDevices[deviceKind]) ?? devices().dropdown[deviceKind][0]!
    if (device.deviceId === '' || device.label === '') {
      console.warn(`Device ${deviceKind} has empty deviceId or label`, { deviceArgs })
      return true
    }

    console.warn('Specified device not found, setting to default', { deviceArgs, default: device })
    return { deviceId: { exact: device.deviceId } }
  }

  /** @throws */
  async function requestNewStream(kind: Kind, deviceArgs: OptionalDevice | 'default') {
    try {
      const constraints = await getMediaConstraints(kind, deviceArgs)
      const stream = await navigator.mediaDevices.getUserMedia({ [kind]: constraints })

      if ((kind === 'audio' && hasEmptyAudioDevices()) || (kind === 'video' && hasEmptyVideoDevices())) {
        console.log('Devices are still not refreshed. Refetching...')
        await refetchDevices()
      }
      return stream
    } catch (error) {
      console.warn('Failed to request new stream', { error })
      throw error
    }
  }

  /** @throws */
  async function requestNewTrack(kind: Kind, deviceArgs: OptionalDevice | 'default') {
    const stream = await requestNewStream(kind, deviceArgs)
    const [track] = stream.getTracks()

    if (!track) throw new Error(`No ${kind} track returned`)
    return track
  }

  async function checkAudioPermissions() {
    if (needToCheckAudioPermissions() === false) return

    try {
      const audioStream = await requestNewStream('audio', 'default')
      audioStream.getAudioTracks().forEach((track) => track.stop())
    } catch (error) {
      console.warn('Failed to request audio permissions', { error })
    }
  }

  async function checkVideoPermissions() {
    if (needToCheckVideoPermissions() === false) return

    try {
      const videoStream = await requestNewStream('video', 'default')
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

    const newTrack = await requestNewTrack(trackKind, newDevice)
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
  async function setOutputDevice(refOrDeviceId: HTMLVideoElement | string) {
    /* Ignore if browser does not support audio output selection */
    if (HAVE_AUDIO_OUTPUT_SELECTOR === false) return

    const storedDevice = findDevice(selectedDevices.audiooutput)
    const newDevice =
      refOrDeviceId instanceof HTMLVideoElement ? devices().dropdown.audiooutput[0] : findDeviceById(refOrDeviceId)

    if (newDevice == null) {
      throw new Error(
        refOrDeviceId instanceof HTMLVideoElement
          ? 'Default device not found for a remote ref'
          : `Device not found: ${refOrDeviceId}`,
      )
    }

    /* Ignore if the device is already selected and it's the same device that was stored */
    if (storedDevice && storedDevice.label === newDevice.label && storedDevice.deviceId === newDevice.deviceId) {
      return
    }

    const ref = refOrDeviceId instanceof HTMLVideoElement ? refOrDeviceId : remoteRef()
    await ref?.setSinkId(newDevice.deviceId)
    setSelectedDevices('audiooutput', newDevice.toJSON())
  }

  async function updateSelectedDeviceValue(kind: MediaDeviceInfo['kind'], deviceId: string) {
    const device = devices().all.find((d) => d.kind === kind && d.deviceId === deviceId)
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
    const transceiver = getTransceiver('audio')
    if (!transceiver) {
      console.warn('Audio toggle should not be called before the offer/answer is created and set on both sides')
      return false
    }

    const oldTrack = transceiver.sender.track

    if (enabled === false) {
      await transceiver.sender.replaceTrack(null)

      if (oldTrack) {
        oldTrack.enabled = false
        oldTrack.stop()
      }

      return false
    }

    if (oldTrack?.readyState === 'live') {
      oldTrack.enabled = true
      return true
    }

    let newTrack: MediaStreamTrack | undefined

    try {
      newTrack = await requestNewTrack('audio', 'default')
      newTrack.enabled = true

      await transceiver.sender.replaceTrack(newTrack)
      return transceiver.sender.track === newTrack && newTrack.readyState === 'live'
      /**
       * Contrary to the video toggle, we don't need to add our audio to our local stream
       * as we won't need to hear ourselves.
       */
    } catch (error) {
      console.warn(`Failed to enable audio`, { error })
      return false
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
        const track = await requestNewTrack('video', 'default')
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

  onCleanup(() => cleanup())

  return {
    toggleAudio,
    toggleVideo,
    setDevice,
    createOffer,
    createAnswer,
    receiveAnswer,
    addPendingCandidates,
    queueCandidate,
    updateSelectedDeviceValue,
    checkAudioPermissions,
    checkVideoPermissions,
    initRtc,
    cleanup,
    confirmConnectionEstablished,
    ...mediaDevices,
  }
}
