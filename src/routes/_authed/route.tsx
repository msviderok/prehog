import { Hat } from '@/components/game-content/Hat'
import { GameUI } from '@/components/game-ui/GameUI'
import { useGlobalState } from '@/components/global-state/context'
import { Loading } from '@/components/Loading'
import { api } from '@/convex/api'
import { authServerFn } from '@/lib/server.functions'
import { createFileRoute, Outlet, redirect, useBlocker, useMatches } from '@tanstack/solid-router'
import { useMutation } from 'convex-solidjs'
import { onCleanup, onMount, Show } from 'solid-js'
import { runGameLoop } from './-gameloop'
import { OtherPlayer } from '@/components/game-content/OtherPlayer'
import { For } from 'solid-js'

export const Route = createFileRoute('/_authed')({
  async beforeLoad() {
    const userId = await authServerFn()
    if (userId == null) throw redirect({ to: '/login' })
  },
  pendingComponent() {
    return <Loading type="clerk" />
  },
  component() {
    const sceneMatch = useMatches({
      select: (matches) => matches.find((m) => m.staticData?.scene)?.staticData.scene,
    })
    const { recalculate, player, scene, otherPlayers } = useGlobalState()
    const getMyInitialState = useMutation(api.gameState.getMyInitialState)

    runGameLoop()

    onMount(() => {
      queueMicrotask(() => recalculate())
      window.addEventListener('resize', recalculate)
      onCleanup(() => window.removeEventListener('resize', recalculate))

      void getMyInitialState.mutate({}).then((s) => {
        player.isWalking = false
        player.direction = 0
        player.facing = s.direction
        player.x = s.x
        recalculate()
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
        <div class="w-min h-min relative">
          <div ref={(el) => (scene.ref = el)} class="scene" data-scene={sceneMatch()}>
            <Outlet />
            <For each={otherPlayers.list()}>{(userId) => <OtherPlayer id={userId} />}</For>
          </div>

          <div
            ref={(el) => (player.ref = el)}
            class="player player-idle"
            data-me={true}
            data-is-admin={player.isAdmin()}
          >
            <Hat hat={player.isAdmin() ? 'admin' : 'baseball'} />
          </div>
        </div>
        <GameUI />
      </Show>
    )
  },
})
