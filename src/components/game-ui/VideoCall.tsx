import { onCleanup, onMount } from 'solid-js'

export function VideoCall() {
  const local = {
    ref: undefined as unknown as HTMLVideoElement,
    peer: undefined as unknown as RTCPeerConnection,
  }
  const remote = {
    ref: undefined as unknown as HTMLVideoElement,
    peer: undefined as unknown as RTCPeerConnection,
  }

  async function start() {
    local.peer = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
    })
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
    local.ref.srcObject = stream

    for (const track of stream.getTracks()) {
      local.peer.addTrack(track, stream)
    }

    local.peer.ontrack = (event) => {
      if (remote.ref) {
        remote.ref.srcObject = event.streams[0]
      }
    }

    local.peer.onicecandidate = (event) => {
      if (event.candidate) {
      }
    }
  }

  onMount(() => {
    start()
    onCleanup(() => local.peer.close())
  })

  return (
    <div>
      <video ref={local.ref} autoplay playsinline />
      <video ref={remote.ref} autoplay playsinline />
    </div>
  )
}
