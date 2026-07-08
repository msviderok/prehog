import { api } from '@/convex/api'
import { useConvexClerkAuth } from '@/lib/convex-clerk'
import { useMutation } from 'convex-solidjs'
import { createEffect, createSignal, onCleanup, onMount } from 'solid-js'

export function useWatchOnlineStatus() {
  const [mounted, setMounted] = createSignal(false)
  const { isAuthenticated } = useConvexClerkAuth()
  const setMyOnline = useMutation(api.users.setMyOnline)

  function onLeave() {
    setMyOnline.mutate({ isOnline: document.visibilityState === 'visible', reason: 'visibility' })
  }

  function onBeforeUnload() {
    setMyOnline.mutate({ isOnline: false, reason: 'unload' })
  }

  createEffect(() => {
    if (!mounted()) return

    if (isAuthenticated()) {
      setMyOnline.mutate({ isOnline: true })
    }
  })

  onMount(() => {
    setMounted(true)

    window.addEventListener('beforeunload', onBeforeUnload)
    window.addEventListener('unload', onBeforeUnload)
    window.addEventListener('pagehide', onLeave)
    document.addEventListener('visibilitychange', onLeave)
    onCleanup(() => {
      window.removeEventListener('beforeunload', onBeforeUnload)
      window.removeEventListener('unload', onBeforeUnload)
      window.removeEventListener('pagehide', onLeave)
      document.removeEventListener('visibilitychange', onLeave)
    })
  })
}
