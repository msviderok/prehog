import type { Doc } from '@/convex/dataModel'
import { createEffect, createMemo, createSignal, onCleanup } from 'solid-js'
import { formatDurationMMSS } from '../duration'

export function useCallDuration(props: { call: Doc<'calls'> }) {
  let interval: NodeJS.Timeout | undefined
  const [now, setNow] = createSignal(Date.now())
  const durationFormatted = createMemo(() => {
    // ignore if not call is not in-progress or if startedAt is not set for some weird reason
    if (!props.call.startedAt || props.call.status !== 'in-progress') return null
    return formatDurationMMSS(props.call.startedAt, now())
  })

  createEffect(() => {
    if (props.call.status === 'in-progress') {
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
