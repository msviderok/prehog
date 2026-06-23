import { api } from '@/convex/api'
import type { Id } from '@/convex/dataModel'
import { createRtcState } from '@/lib/state/createRtcState'
import { useMutation, useQuery } from 'convex-solidjs'
import { createEffect, on, Show } from 'solid-js'
import { RtcCard } from './RtcCard'
import { RtcContext, useRtcContext } from './useRtcContext'

export function RtcPanel(_props: RtcPanel.Props) {
  const rtcState = createRtcState()
  const { data: callStatus } = useQuery(api.activeCall.status, {})
  const { data: theirUser } = useQuery(api.activeCall.findTheirUser, {})
  const { data: myParticipant } = useQuery(api.activeCall.findMyParticipant, {})
  const { data: theirParticipant } = useQuery(api.activeCall.findTheirParticipant, {})

  return (
    <RtcContext.Provider
      value={{
        rtc: rtcState,
        get callStatus() {
          return callStatus()!
        },
        get theirUser() {
          return theirUser()!
        },
        get myParticipant() {
          return myParticipant()!
        },
        get theirParticipant() {
          return theirParticipant()
        },
      }}
    >
      <Show when={callStatus() && theirUser() && myParticipant()}>
        <RtcCard />
      </Show>
      <RtcEffectsListener />
    </RtcContext.Provider>
  )
}

function RtcEffectsListener() {
  useHandleMediaToggle()
  useHandleSendOffer()
  useHandleReceiveOfferAndSendAnswer()
  useHandleReceiveAnswer()
  useHandleIceCandidates()
  return null
}

function useHandleMediaToggle() {
  const { rtc } = useRtcContext()
  const { data: audio } = useQuery(api.activeCall.myAudio, {}, { initialData: false, keepPreviousData: true })
  const { data: video } = useQuery(api.activeCall.myVideo, {}, { initialData: false, keepPreviousData: true })
  const { data: isCallEstablished } = useQuery(
    api.activeCall.isCallEstablished,
    {},
    { initialData: false, keepPreviousData: true },
  )

  /* Mute/unmute audio */
  createEffect(
    on([() => audio()!, () => isCallEstablished()!], ([enabled, callEstablished]) => {
      if (callEstablished === false) return
      rtc.toggleAudio(enabled)
    }),
  )

  /* Start/stop video */
  createEffect(
    on([() => video()!, () => isCallEstablished()!], ([enabled, callEstablished]) => {
      if (callEstablished === false) return
      rtc.toggleVideo(enabled)
    }),
  )
}

function useHandleSendOffer() {
  const { rtc } = useRtcContext()
  const canSendOffer = useQuery(api.activeCall.canSendOfferRtcMessage, {})
  const sendRtcMessage = useMutation(api.activeCall.sendRtcMessage)

  createEffect(
    on(
      () => canSendOffer.data() ?? false,
      async (sendOfferAllowed) => {
        if (sendOfferAllowed === false) return
        const offer = await rtc.createOffer()
        sendRtcMessage.mutate({ message: { type: 'offer', data: offer } })
      },
    ),
  )
}

function useHandleReceiveOfferAndSendAnswer() {
  const { rtc } = useRtcContext()
  const canSendAnswer = useQuery(api.activeCall.canSendAnswerRtcMessage, {})
  const sendRtcMessage = useMutation(api.activeCall.sendRtcMessage)
  const claimRtcMessage = useMutation(api.activeCall.claimRtcMessage)

  /* Receive offer, claim it and then create and send the answer */
  createEffect(
    on(
      () => canSendAnswer.data() ?? false,
      async (offer) => {
        if (!offer) return
        const answer = await rtc.createAnswer(offer.data)
        await claimRtcMessage.mutate({ ids: offer._id })
        await sendRtcMessage.mutate({ message: { type: 'answer', data: answer } })
      },
    ),
  )
}

function useHandleReceiveAnswer() {
  const { rtc } = useRtcContext()
  const claimRtcMessage = useMutation(api.activeCall.claimRtcMessage)
  const canClaimAnswer = useQuery(api.activeCall.canClaimAnswer, {})

  /* Receive answer and claim it */
  createEffect(
    on(
      () => canClaimAnswer.data() ?? false,
      async (answer) => {
        if (!answer) return

        await rtc.myRTC.peer.setRemoteDescription(answer.data)
        await rtc.addPendingCandidates()
        await claimRtcMessage.mutate({ ids: answer._id })
      },
    ),
  )
}

function useHandleIceCandidates() {
  const { rtc } = useRtcContext()
  const isCallEstablished = useQuery(api.activeCall.isCallEstablished, {})
  const iceCandidateRtcMessages = useQuery(api.activeCall.iceCandidateRtcMessages, {})
  const claimRtcMessage = useMutation(api.activeCall.claimRtcMessage)

  /* Process all the incoming ice-candidates */
  const processedEntries = new Set<Id<'call_rtc_messages'>>()
  createEffect(
    on(iceCandidateRtcMessages.data, async (candidates) => {
      if (!candidates) return

      const processedIds = []
      for (const candidate of candidates) {
        /* Ignore the candidate if we've already processed it, otherwise add it to the set. */
        if (processedEntries.has(candidate._id)) continue
        processedEntries.add(candidate._id)

        if (candidate.type === 'ice-candidate') {
          if (rtc.myRTC.peer.remoteDescription) {
            await rtc.myRTC.peer.addIceCandidate(candidate.data)
          } else {
            rtc.myRTC.pendingCandidates.push(candidate.data)
          }

          processedIds.push(candidate._id)
          continue
        }
      }

      if (processedIds.length) {
        await claimRtcMessage.mutate({ ids: processedIds })
      }
    }),
  )

  /* Once the call is established we can process pending ICE candidates if there are any */
  createEffect(
    on(
      () => isCallEstablished.data() ?? false,
      (callEstablished) => {
        if (callEstablished) rtc.addPendingCandidates()
      },
    ),
  )
}

export namespace RtcPanel {
  export type Props = PanelTypeRTC
}
