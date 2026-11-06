import { api } from '@/convex/api'
import { HEARTBEAT_MS } from '@/lib/constants'
import { useMutation } from 'convex-solidjs'
import { onCleanup, onMount } from 'solid-js'

export function useWatchPresence() {
  let interval: NodeJS.Timeout | undefined
  const sendHeartbeat = useMutation(api.heartbeats.updateHeartbeat)

  function startInterval() {
    if (interval) clearInterval(interval)
    void sendHeartbeat.mutate({})
    interval = setInterval(() => sendHeartbeat.mutate({}), HEARTBEAT_MS)
  }

  function stopInterval() {
    if (interval) clearInterval(interval)
    interval = undefined
  }

  function onVisibilityChange() {
    return document.hidden ? stopInterval() : startInterval()
  }

  onMount(() => {
    startInterval()
    document.addEventListener('visibilitychange', onVisibilityChange)
  })

  onCleanup(() => {
    stopInterval()
    document.removeEventListener('visibilitychange', onVisibilityChange)
  })
}
