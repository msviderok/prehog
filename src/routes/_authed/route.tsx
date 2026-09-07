import { GameUI } from '@/components/game-ui/GameUI'
import { useGlobalState } from '@/components/GlobalStateContext'
import { Loading } from '@/components/Loading'
import { api } from '@/convex/api'
import { authServerFn } from '@/lib/server.functions'
import { createFileRoute, Outlet, redirect, useBlocker, useRouter } from '@tanstack/solid-router'
import { useMutation } from 'convex-solidjs'
import { onCleanup, onMount, Show } from 'solid-js'
import { runGameLoop } from './-gameloop'

export const Route = createFileRoute('/_authed')({
  staticData: { scene: null },
  async beforeLoad() {
    const userId = await authServerFn()
    if (userId == null) throw redirect({ to: '/login' })
  },
  pendingComponent() {
    return <Loading type="clerk" />
  },
  component() {
    const router = useRouter()
    const { recalculate, player } = useGlobalState()
    const getMyInitialState = useMutation(api.gameState.getMyInitialState)

    runGameLoop()

    onMount(() => {
      queueMicrotask(() => recalculate())
      window.addEventListener('resize', recalculate)
      const unsubscribe = router.subscribe('onRendered', recalculate)

      void getMyInitialState.mutate({}).then((s) => {
        player.isWalking = false
        player.direction = 0
        player.facing = s.direction
        player.x = s.x
        recalculate()
      })

      onCleanup(() => {
        window.removeEventListener('resize', recalculate)
        unsubscribe()
      })
    })

    useBlocker({
      enableBeforeUnload: false,
      shouldBlockFn: ({ action }) => {
        if (action === 'BACK' || action === 'FORWARD') return true
        return false
      },
    })

    return (
      <Show when={getMyInitialState.data() != undefined} fallback={<Loading type="convex" />}>
        <Outlet />
        <GameUI />
      </Show>
    )
  },
})
