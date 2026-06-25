import { api } from '@/convex/api'
import { useQuery } from 'convex-solidjs'
import { createEffect, createMemo, createSignal, onCleanup } from 'solid-js'
import { formatDurationMMSS } from '@/lib/date'

export function useCallDuration() {
  let interval: NodeJS.Timeout | undefined
  const [now, setNow] = createSignal(Date.now())
  const { data: startedAt } = useQuery(api.activeCall.startedAt, {})
  const { data: callStatus } = useQuery(api.activeCall.status, {})

  const durationFormatted = createMemo(() => {
    const startedAtResolved = startedAt()
    // ignore if not call is not in-progress or if startedAt is not set for some weird reason
    if (!startedAtResolved || callStatus() !== 'in-progress') return null
    return formatDurationMMSS(startedAtResolved, now())
  })

  createEffect(() => {
    if (callStatus() === 'in-progress') {
      interval = setInterval(() => setNow(Date.now()), 1000)
      onCleanup(() => {
        if (interval) {
          clearInterval(interval)
          interval = undefined
        }
      })
    }
  })

  return durationFormatted
}
