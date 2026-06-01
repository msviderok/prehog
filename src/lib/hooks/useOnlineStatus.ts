import { useMutation } from 'convex-solidjs'
import { useConvexClerkAuth } from '../integrations/convex-clerk'
import { api } from '../../../convex/_generated/api'
import { createEffect, onCleanup, onMount } from 'solid-js'

export function useOnlineStatus() {
  const { isAuthenticated } = useConvexClerkAuth()
  const setMyOnline = useMutation(api.users.setMyOnline)

  function onLeave() {
    void setMyOnline.mutate({ isOnline: document.visibilityState === 'visible' })
  }
  function onBeforeUnload() {
    void setMyOnline.mutate({ isOnline: false })
  }

  createEffect(() => {
    if (isAuthenticated()) {
      void setMyOnline.mutate({ isOnline: true })
    }
  })

  onMount(() => {
    window.addEventListener('beforeunload', onBeforeUnload)
    document.addEventListener('visibilitychange', onLeave)
    onCleanup(() => {
      window.removeEventListener('beforeunload', onBeforeUnload)
      document.removeEventListener('visibilitychange', onLeave)
      void setMyOnline.mutate({ isOnline: false })
    })
  })
}
