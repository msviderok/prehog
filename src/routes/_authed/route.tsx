import { GameUI } from '@/components/game-ui/GameUI'
import { api } from '@/convex/api'
import { HEARTBEAT_MS } from '@/lib/constants'
import { Loading } from '@/routes/_authed/-components/Loading'
import { createFileRoute, Outlet, useBlocker, useRouter } from '@tanstack/solid-router'
import { useMutation } from 'convex-solidjs'
import { onCleanup, onMount, Show, type ParentProps } from 'solid-js'
import { useGlobalState } from './-components/GlobalStateContext'
import { GlobalStateProvider } from './-components/GlobalStateProvider'
import { SceneryPopoverProvider } from './-components/SceneryPopover'
import { runGameLoop } from './-gameloop'
import { useAudioManager } from '@/audio/useAudioManager'

export const Route = createFileRoute('/_authed')({
  staticData: { scene: null },
  pendingComponent() {
    return <Loading type="clerk" />
  },
  component() {
    useWatchPresence()
    useAudioManager()

    return (
      <GlobalStateProvider>
        <SceneryPopoverProvider>
          <main class="h-screen w-screen max-w-screen max-h-screen min-w-screen min-h-screen flex items-center overflow-hidden justify-center">
            <AuthedWrapper>
              <Outlet />
            </AuthedWrapper>
          </main>
        </SceneryPopoverProvider>
      </GlobalStateProvider>
    )
  },
})

function AuthedWrapper(props: ParentProps) {
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
      {props.children}
      <GameUI />
    </Show>
  )
}

function useWatchPresence() {
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
