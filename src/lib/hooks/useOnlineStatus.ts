import { useMutation } from 'convex-solidjs'
import { useConvexClerkAuth } from '../integrations/convex-clerk'
import { api } from '@/convex/api'
import { createEffect, createSignal, onCleanup, onMount } from 'solid-js'
import { env } from '@/env'

export function useOnlineStatus() {
  if (env.VITE_OFFLINE) return

  const [mounted, setMounted] = createSignal(false)
  const { isAuthenticated } = useConvexClerkAuth()
  const setMyOnline = useMutation(api.users.setMyOnline)

  function onLeave() {
    setMyOnline.mutate({ isOnline: document.visibilityState === 'visible' })
  }
  function onBeforeUnload() {
    void setMyOnline.mutate({ isOnline: false })
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
    window.addEventListener('pagehide', onBeforeUnload)
    document.addEventListener('visibilitychange', onLeave)
    onCleanup(() => {
      window.removeEventListener('beforeunload', onBeforeUnload)
      window.removeEventListener('unload', onBeforeUnload)
      window.removeEventListener('pagehide', onBeforeUnload)
      document.removeEventListener('visibilitychange', onLeave)
    })
  })
}
