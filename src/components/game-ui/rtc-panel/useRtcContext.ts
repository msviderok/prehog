import type { api } from '@/convex/api'
import type { RtcState } from '@/lib/state/createRtcState'
import type { FunctionReturnType } from 'convex/server'
import { createContext, useContext } from 'solid-js'

export const RtcContext = createContext<{
  rtc: RtcState
  callStatus: FunctionReturnType<typeof api.activeCall.status>
  theirUser: NonNullable<FunctionReturnType<typeof api.activeCall.findTheirUser>>
  myParticipant: NonNullable<FunctionReturnType<typeof api.activeCall.findMyParticipant>>
  theirParticipant: FunctionReturnType<typeof api.activeCall.findTheirParticipant> | undefined
}>()

export function useRtcContext() {
  const ctx = useContext(RtcContext)
  if (!ctx) throw new Error('useRtcContext must be used within an RtcContext')
  return ctx
}
