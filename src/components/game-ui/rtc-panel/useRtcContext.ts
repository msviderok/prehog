import type { RtcState } from '@/lib/state/createRtcState'
import { createContext, useContext } from 'solid-js'

export const RtcContext = createContext<RtcState>()

export function useRtcContext() {
  const ctx = useContext(RtcContext)
  if (!ctx) throw new Error('useRtcContext must be used within an RtcContext')
  return ctx
}
