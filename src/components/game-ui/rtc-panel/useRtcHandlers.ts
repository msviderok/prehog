import { useGlobalState } from '@/components/GlobalStateContext'
import { api } from '@/convex/api'
import type { Id } from '@/convex/dataModel'
import { SOUNDS } from '@/lib/sounds'
import { useMutation, useQuery } from 'convex-solidjs'
import { createEffect, on, onCleanup } from 'solid-js'

export function useHandleMediaToggle() {
  const { rtc } = useGlobalState()
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

export function useHandleSendOffer() {
  const { rtc } = useGlobalState()
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

export function useHandleReceiveOfferAndSendAnswer() {
  const { rtc } = useGlobalState()
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

export function useHandleReceiveAnswer() {
  const { rtc } = useGlobalState()
  const claimRtcMessage = useMutation(api.activeCall.claimRtcMessage)
  const canClaimAnswer = useQuery(api.activeCall.canClaimAnswer, {})

  /* Receive answer and claim it */
  createEffect(
    on(
      () => canClaimAnswer.data() ?? false,
      async (answer) => {
        if (!answer) return

        await rtc.receiveAnswer(answer.data)
        await claimRtcMessage.mutate({ ids: answer._id })
      },
    ),
  )
}

export function useHandleIceCandidates() {
  const { rtc } = useGlobalState()
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
          await rtc.queueCandidate(candidate.data)
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

export function useHandleSound() {
  const { data: callStatus } = useQuery(api.activeCall.status, {})
  const { data: myParticipant } = useQuery(api.activeCall.findMyParticipant, {})

  onCleanup(() => {
    SOUNDS.dial.stop()
    SOUNDS.call.stop()

    if (SOUNDS.end.playing() === false) {
      SOUNDS.end.play()
    }
  })

  createEffect(() => {
    if (callStatus() === 'in-progress') {
      SOUNDS.dial.stop()
      SOUNDS.call.stop()
      return
    }

    if (myParticipant()?.role === 'host') {
      if (callStatus() === 'awaiting-response' && SOUNDS.dial.playing() === false) {
        SOUNDS.dial.play()
      }
      onCleanup(() => SOUNDS.dial.stop())
      return
    }

    if (myParticipant()?.role === 'participant') {
      if (callStatus() === 'awaiting-response' && SOUNDS.call.playing() === false) {
        SOUNDS.call.play()
      }
      onCleanup(() => SOUNDS.call.stop())
      return
    }
  })
}

export function useHandleRtcCleanup() {
  const { rtc } = useGlobalState()
  onCleanup(() => rtc.cleanup())
}
