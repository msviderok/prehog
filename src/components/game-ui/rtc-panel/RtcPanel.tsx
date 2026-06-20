import { api } from '@/convex/api'
import type { Id } from '@/convex/dataModel'
import { createRtcState } from '@/lib/state/createRtcState'
import { useMutation, useQuery } from 'convex-solidjs'
import { createEffect, createMemo, on, Show } from 'solid-js'
import { RtcCard } from './RtcCard'
import { RtcContext } from './useRtcContext'

export function RtcPanel(_props: RtcPanel.Props) {
  const rtcState = createRtcState()

  const call = useQuery(api.activeCall.get, {})
  const myCallState = useQuery(api.activeCall.myCallState, {})
  const participantUser = useQuery(api.activeCall.findParticipantUser, {})

  const offerRtcMessage = useQuery(api.activeCall.offerRtcMessage, {})
  const answerRtcMessage = useQuery(api.activeCall.answerRtcMessage, {})
  const iceCandidateRtcMessages = useQuery(api.activeCall.iceCandidateRtcMessages, {})

  const sendRtcMessage = useMutation(api.activeCall.sendRtcMessage)
  const deleteRtcMessage = useMutation(api.activeCall.deleteRtcMessage)
  const deleteRtcMessages = useMutation(api.activeCall.deleteRtcMessages)

  const isLoaded = createMemo(() =>
    call.data() && myCallState.data() && participantUser.data()
      ? { call: call.data()!, state: myCallState.data()!, user: participantUser.data()! }
      : false,
  )

  /* Mute/unmute audio */
  createEffect(on(() => myCallState.data()?.audio ?? false, rtcState.toggleAudio))
  /* Start/stop video */
  createEffect(on(() => myCallState.data()?.video ?? false, rtcState.toggleVideo))

  /**
   * Create and send offer:
   *    - if the call just got accepted
   *        (status === 'in-progress' && prevStatus === 'awaiting-response')
   *    - if the page was refreshed while the call was in progress
   *        (status === 'in-progress' && prevStatus === undefined)
   */
  createEffect(
    on([() => call.data()?.status, () => myCallState.data()?.role], async ([status, role], prev) => {
      if (role == null || role !== 'host') return

      const [prevStatus] = prev ?? []
      if (status === 'in-progress' && (prevStatus === undefined || prevStatus === 'awaiting-response')) {
        rtcState.myRTC.peer.addTransceiver('audio', { direction: 'sendrecv' })
        rtcState.myRTC.peer.addTransceiver('video', { direction: 'sendrecv' })
        await rtcState.attachBothAudioVideo()

        const offer = await rtcState.createOffer()
        sendRtcMessage.mutate({ message: { type: 'offer', data: offer } })
        return
      }
    }),
  )

  /* Receive offer and create answer */
  createEffect(
    on(offerRtcMessage.data, async (offer) => {
      if (offer == null) return

      await rtcState.myRTC.peer.setRemoteDescription(offer.data)
      await rtcState.addPendingCandidates()
      await rtcState.attachBothAudioVideo()
      const answer = await rtcState.createAnswer()
      await sendRtcMessage.mutate({ message: { type: 'answer', data: answer } })
    }),
  )

  /* Receive answer */
  createEffect(
    on(answerRtcMessage.data, async (answer) => {
      if (answer == null) return

      await rtcState.myRTC.peer.setRemoteDescription(answer.data)
      await rtcState.addPendingCandidates()
      await deleteRtcMessage.mutate({ id: answer._id })
    }),
  )

  /* Process all the incoming ice-candidates */
  const processedEntries = new Set<Id<'call_rtc_messages'>>()
  createEffect(
    on(iceCandidateRtcMessages.data, async (candidates) => {
      if (!candidates) return

      const deleteIds = []
      for (const candidate of candidates) {
        /* Ignore the candidate if we've already processed it, otherwise add it to the set. */
        if (processedEntries.has(candidate._id)) continue
        processedEntries.add(candidate._id)

        if (candidate.type === 'ice-candidate') {
          if (rtcState.myRTC.peer.remoteDescription) {
            await rtcState.myRTC.peer.addIceCandidate(candidate.data)
          } else {
            rtcState.myRTC.pendingCandidates.push(candidate.data)
          }

          deleteIds.push(candidate._id)
          continue
        }
      }

      if (deleteIds.length) {
        await deleteRtcMessages.mutate({ ids: deleteIds })
      }
    }),
  )

  return (
    <RtcContext.Provider value={rtcState}>
      <Show when={isLoaded()}>{(cardProps) => <RtcCard {...cardProps()} />}</Show>
    </RtcContext.Provider>
  )
}

export namespace RtcPanel {
  export type Props = PanelTypeRTC
}
