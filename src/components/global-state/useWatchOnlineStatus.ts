import { api } from '@/convex/api'
import { useMutation } from 'convex-solidjs'
import { onCleanup, onMount } from 'solid-js'

const HEARTBEAT_MS = 10_000

export function useWatchOnlineStatus() {
  let interval: NodeJS.Timeout | undefined
  const sendHeartbeat = useMutation(api.heartbeats.updateHeartbeat)

  function onVisibilityChange() {
    if (document.hidden) {
      if (interval) {
        clearInterval(interval)
        interval = undefined
      }
      return
    }

    void sendHeartbeat.mutate({})
    if (interval) clearInterval(interval)
    interval = setInterval(() => sendHeartbeat.mutate({}), HEARTBEAT_MS)
  }

  onMount(() => {
    document.addEventListener('visibilitychange', onVisibilityChange)

    void sendHeartbeat.mutate({})
    if (interval) clearInterval(interval)
    interval = setInterval(() => sendHeartbeat.mutate({}), HEARTBEAT_MS)

    onCleanup(() => {
      if (interval) clearInterval(interval)
      document.removeEventListener('visibilitychange', onVisibilityChange)
    })
  })
}
