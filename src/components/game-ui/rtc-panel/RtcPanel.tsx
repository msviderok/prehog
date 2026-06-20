import { api } from '@/convex/api'
import { createRtcState } from '@/lib/state/createRtcState'
import { useMutation, useQuery } from 'convex-solidjs'
import { createEffect, createMemo, Match, on, Show, Switch } from 'solid-js'
import { GuestPanel } from './GuestPanel'
import { HostPanel } from './HostPanel'
import { RtcContext } from './useRtcContext'

export function RtcPanel(_props: RtcPanel.Props) {
  const rtcState = createRtcState()
  const call = useQuery(api.activeCall.get, {})
  const myCallState = useQuery(api.activeCall.myCallState, {})
  const hostUser = useQuery(api.activeCall.hostUser, {})
  const guestUser = useQuery(api.activeCall.guestUser, {})
  const pendingRtcMessages = useQuery(api.activeCall.pendingRtcMessages, {})

  const sendRtcMessage = useMutation(api.activeCall.sendRtcMessage)
  const deleteRtcMessage = useMutation(api.activeCall.deleteRtcMessage)

  const isLoaded = createMemo(() => {
    return (
      !!(call.isLoading() === false && call.data()) &&
      !!(myCallState.isLoading() === false && myCallState.data()) &&
      !!(hostUser.isLoading() === false && hostUser.data()) &&
      !!(guestUser.isLoading() === false && guestUser.data())
    )
  })

  createEffect(on(() => myCallState.data()?.audio ?? false, rtcState.toggleAudio))
  createEffect(on(() => myCallState.data()?.video ?? false, rtcState.toggleVideo))

  createEffect(
    on(pendingRtcMessages.data, async (messages) => {
      for (const message of messages ?? []) {
        if (message.type === 'ice-candidate') {
          if (rtcState.myRTC.peer.remoteDescription) {
            await rtcState.myRTC.peer.addIceCandidate(message.data)
          } else {
            rtcState.myRTC.pendingCandidates.push(message.data)
          }

          await deleteRtcMessage.mutate({ id: message._id })
          continue
        }

        if (message.type === 'offer') {
          await rtcState.myRTC.peer.setRemoteDescription(message.data)
          await rtcState.addPendingCandidates()

          const answer = await rtcState.createAnswer()
          await rtcState.myRTC.peer.setLocalDescription(answer)

          await sendRtcMessage.mutate({ message: { type: 'answer', data: answer } })
          continue
        }

        if (message.type === 'answer') {
          await rtcState.myRTC.peer.setRemoteDescription(message.data)
          await rtcState.addPendingCandidates()
          continue
        }
      }
    }),
  )

  createEffect(
    on(
      () => call.data()?.status,
      async (status, prevStatus) => {
        /**
         * If the call just got accepted:
         *   status === 'in-progress' && prevStatus === 'awaiting-response'
         *
         * If the page was refreshed while the call was in progress:
         *   status === 'in-progress' && prevStatus === undefined
         */
        if (status === 'in-progress' && (prevStatus === undefined || prevStatus === 'awaiting-response')) {
          rtcState.myRTC.peer.addTransceiver('audio', { direction: 'sendrecv' })
          rtcState.myRTC.peer.addTransceiver('video', { direction: 'sendrecv' })
          const offer = await rtcState.createOffer()
          sendRtcMessage.mutate({ message: { type: 'offer', data: offer } })
          return
        }
      },
    ),
  )

  return (
    <RtcContext.Provider value={rtcState}>
      <Show when={isLoaded()}>
        <Switch>
          <Match when={myCallState.data()!.role === 'host'}>
            <HostPanel state={myCallState.data()!} call={call.data()!} user={guestUser.data()!} />
          </Match>
          <Match when={myCallState.data()!.role === 'participant'}>
            <GuestPanel state={myCallState.data()!} call={call.data()!} user={hostUser.data()!} />
          </Match>
        </Switch>
      </Show>
    </RtcContext.Provider>
  )
}

// <div>
//   <video ref={local.ref} autoplay playsinline />
//   <video ref={remote.ref} autoplay playsinline />
// </div>
//
//  // local.peer.ontrack = (event) => {
//   if (remote.ref) {
//     remote.ref.srcObject = event.streams[0]
//   }
// }

// local.peer.onicecandidate = (event) => {
//   if (event.candidate) {
//   }
// }

export namespace RtcPanel {
  export type Props = PanelTypeRTC
}
