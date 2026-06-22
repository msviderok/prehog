import type { Doc } from '@/convex/dataModel'
import { createEffect, createMemo, createSignal, onCleanup } from 'solid-js'
import { formatDurationMMSS } from '../duration'
import { useQuery } from 'convex-solidjs'
import { api } from '@/convex/api'

export function useCallDuration(props: { callStatus: Doc<'calls'>['status'] }) {
  let interval: NodeJS.Timeout | undefined
  const [now, setNow] = createSignal(Date.now())
  const { data: startedAt } = useQuery(api.activeCall.startedAt, {})

  const durationFormatted = createMemo(() => {
    const startedAtResolved = startedAt()
    // ignore if not call is not in-progress or if startedAt is not set for some weird reason
    if (!startedAtResolved || props.callStatus !== 'in-progress') return null
    return formatDurationMMSS(startedAtResolved, now())
  })

  createEffect(() => {
    if (props.callStatus === 'in-progress') {
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
