import { useRtcContext } from './useRtcContext'

export function VideoView(props: { type: 'my-view' | 'them-view' }) {
  const { myRTC, setRemoteVideoRef } = useRtcContext()
  return (
    <div class="w-full h-full flex items-center justify-center overflow-hidden aspect-video">
      <video
        autoplay
        playsinline
        muted={props.type === 'my-view'}
        class="border h-full w-full object-cover"
        ref={(el) => {
          if (props.type === 'my-view') {
            myRTC.setRef(el)
            el.srcObject = myRTC.stream
          } else {
            setRemoteVideoRef(el)
          }
        }}
      />
    </div>
  )
}
