import { useWatchOnlineStatus } from '@/components/global-state/useWatchOnlineStatus'
import { cn, defaultProps, getGameContentHeight } from '@/lib/utils'
import { SignIn, useAuth, useClerk } from 'clerk-solidjs-tanstack-start'
import {
  createContext,
  createEffect,
  createMemo,
  createSignal,
  Index,
  Match,
  on,
  onCleanup,
  onMount,
  Show,
  Switch,
  useContext,
  type Accessor,
} from 'solid-js'
import { createStore } from 'solid-js/store'
import { Motion } from 'solid-motionone'
import { GameContent } from '../game-content/GameContent'
import { GameUI } from '../game-ui/GameUI'
import { createAsyncPlayerState } from './createAsyncPlayerState'
import { createKeyboardState } from './createKeyboardState'
import { createRtcState } from './createRtcState'
import { createSceneState } from './createSceneState'
import { createOnlineUsersState } from './createOnlineUsersState'

type LoadStatus = 'signed-out' | 'loading-clerk' | 'loading-game-state' | 'signed-in'

const GlobalStateContext = createContext<{
  keyboard: ReturnType<typeof createKeyboardState>
  player: ReturnType<typeof createAsyncPlayerState>
  onlineUsers: ReturnType<typeof createOnlineUsersState>
  scene: ReturnType<typeof createSceneState>
  rtc: ReturnType<typeof createRtcState>
  loadStatus: Accessor<LoadStatus>
}>()

export function useGlobalState() {
  const context = useContext(GlobalStateContext)
  if (!context) throw new Error('useGlobalState must be used inside GlobalState.Provider')
  return context
}

export function GlobalStateProvider() {
  useWatchOnlineStatus()

  const clerk = useClerk()
  const auth = useAuth()

  /** Locally managed state that doesn't have to be fetched from Convex. */
  const keyboardState = createKeyboardState()
  const rtcState = createRtcState()
  const onlineUsersState = createOnlineUsersState()

  /** Convex-bounded state that is required to show the proper loading screen state. */
  const [loadedState, setLoadedState] = createStore({ player: false, scene: false })
  const sceneState = createSceneState({
    onLoaded: () => setLoadedState({ scene: true }),
    get loaded() {
      return loadedState.scene
    },
  })
  const playerState = createAsyncPlayerState({
    onLoaded: () => setLoadedState({ player: true }),
    get loaded() {
      return loadedState.player
    },
  })

  const allStatesLoaded = createMemo(() => Object.values(loadedState).every(Boolean))
  const loadStatus = createMemo<LoadStatus>(() => {
    if (auth.userId() === null) return 'signed-out'
    if (allStatesLoaded() === false) {
      return clerk().loaded ? 'loading-game-state' : 'loading-clerk'
    }
    return 'signed-in'
  })

  createEffect(() => {
    playerState.ref?.style.setProperty('--running-mod', `${keyboardState.keyPressed.shift ? 2.5 : 1}`)
  })

  function onWindowResize() {
    sceneState.setState('scale', Math.min(getGameContentHeight() / sceneState.state.originalSize.height, 1))
  }

  createEffect(
    on(allStatesLoaded, (shouldRunCalcs) => {
      if (shouldRunCalcs === false) return

      queueMicrotask(() => onWindowResize())
      window.addEventListener('resize', onWindowResize)
      onCleanup(() => {
        window.removeEventListener('resize', onWindowResize)
      })
    }),
  )

  onMount(() => {
    console.log('GAME MOUNT')
  })

  onCleanup(() => {
    console.log('GAME CLEANUP')
  })

  return (
    <GlobalStateContext.Provider
      value={{
        keyboard: keyboardState,
        scene: sceneState,
        player: playerState,
        onlineUsers: onlineUsersState,
        rtc: rtcState,
        loadStatus,
      }}
    >
      <main class="h-screen w-screen max-w-screen max-h-screen min-w-screen min-h-screen flex items-center overflow-hidden">
        <Show when={loadStatus() === 'signed-in'}>
          <GameContent />
          <GameUI />
        </Show>

        <Show when={loadStatus() !== 'signed-in'}>
          <div class="size-full flex items-center justify-center [--size:300px]">
            <Switch>
              <Match when={loadStatus() === 'signed-out'}>
                <SignIn />
              </Match>

              <Match when={loadStatus() === 'loading-clerk' || loadStatus() === 'loading-game-state'}>
                <div class="flex flex-col items-center justify-center relative bg-tertiary rounded-full size-(--size)  animate-pulse">
                  <div class="relative player player-walk [--scale:0.5] [--tx:calc(50%+0.5em)] [--ty:calc(50%-1em)]" />
                  <span class="text-accent tracking-wide typing">
                    Loading {loadStatus() === 'loading-clerk' ? 'Clerk' : 'Game State'}
                  </span>
                </div>
              </Match>
            </Switch>
          </div>
        </Show>
      </main>
    </GlobalStateContext.Provider>
  )
}

const CircularText = (componentProps: { text: string; spinDuration?: number; class?: string }) => {
  const props = defaultProps(componentProps, { spinDuration: 10 })
  const letters = createMemo(() => Array.from(props.text))
  const len = createMemo(() => letters().length)
  const [rotation, setRotation] = createSignal(0)

  return (
    <Motion.div
      class={cn(
        'size-full absolute top-0 font-black text-accent text-center cursor-pointer origin-center',
        props.class,
      )}
      // animate={{ rotate: [10, 0, -10, 0, 10] }}
      transition={{
        rotate: {
          duration: 3,
          repeat: Infinity,
          easing: 'ease-in-out',
        },
      }}
    >
      <Index each={letters()}>
        {(letter, i) => {
          const rotationDeg = -60 + (120 * i) / (len() - 1)

          const factor = Math.PI / len()
          const x = factor * i
          const y = factor * i
          const transform = `rotateX(180deg) rotateY(0deg) rotateZ(${rotationDeg}deg) translate3d(${x}px, ${y}px, 0)`

          return (
            <span
              class="absolute inline-block inset-0 text-xl transition-all duration-500 ease-[cubic-bezier(0,0,0,1)]"
              style={{ transform, '-webkit-transform': transform }}
            >
              {letter()}
            </span>
          )
        }}
      </Index>
    </Motion.div>
  )
}
