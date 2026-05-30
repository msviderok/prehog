import { createStore } from 'solid-js/store'

export type RtcState = ReturnType<typeof createRtcState>

export function createRtcState() {
  const [rtc, setRtc] = createStore({
    pc: new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] }),
    ref: null as HTMLVideoElement | null,
    stream: null as MediaStream | null,
  })

  return { rtc, setRtc }
}
