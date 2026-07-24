import { api } from '@/convex/api'
import type { Id } from '@/convex/dataModel'
import {
  GAME_CONTENT_HEIGHT_RATIO,
  HEARTBEAT_MS,
  ORIGINAL_SCENE_SIZE,
  PLAYER_BASE_SPEED,
  PLAYER_RUNNING_SPEED_MOD,
  PLAYER_SIZE,
  SCENE_PLAYER_OFFSET_Y,
  type Hat,
} from '@/lib/constants'
import { clamp } from '@/lib/utils'
import { SignIn, useAuth, useClerk } from 'clerk-solidjs-tanstack-start'
import { useMutation, useQuery } from 'convex-solidjs'
import {
  createContext,
  createEffect,
  createMemo,
  createSignal,
  Match,
  on,
  onCleanup,
  onMount,
  Show,
  Switch,
  useContext,
  type Accessor,
  type Setter,
} from 'solid-js'
import { createStore } from 'solid-js/store'
import { GameContent } from '../game-content/GameContent'
import { GameUI } from '../game-ui/GameUI'
import { createRtcState } from './createRtcState'

type LoadingStatus = 'signed-out' | 'loading-clerk' | 'loading-game-state' | 'signed-in'

interface GlobalState {
  readonly nodes: Set<SceneNode>
  readonly keypressed: Record<string, boolean | undefined>
  readonly rtc: ReturnType<typeof createRtcState>
  readonly loadingStatus: Accessor<LoadingStatus>
  readonly scene: {
    ref: HTMLElement | undefined
    scale: number
    worldUnit: Coords
    scaled: Size
    walkableMinX: number
    walkableMaxX: number
    cameraX: number
    cameraStartMovingX: number
    cameraEndMovingX: number
    s50: number // 50% of the screen width
    /*
     * Scrollable width of the screen to allow free player movement at the first/last 50%
     * of the viewport width at the start/end of the scene
     */
    cameraViewportWidth: number
  }
  readonly otherPlayers: {
    list: Accessor<Id<'users'>[]>
    hashmap: Map<Id<'users'>, OtherPlayer>
  }
  readonly player: {
    ref: HTMLElement | undefined
    scaled: Size
    scaledHalf: Size
    widthInWorldUnits: number
    hitboxScaled: Hitbox
    x: number
    realX: number
    cameraX: number
    cameraMinX: number
    cameraMaxX: number
    direction: 1 | 0 | -1 // 1 – right, 0 – stopped, -1 – left
    isWalking: boolean
    isRunning: boolean
    facing: 'left' | 'right'
    speed: number
    shouldSendBatches: boolean
    hat: Accessor<Hat>
    setHat: Setter<Hat>
    isAdmin: Accessor<boolean>
  }
}

const GlobalStateContext = createContext<GlobalState>()

export function useGlobalState() {
  const context = useContext(GlobalStateContext)
  if (!context) throw new Error('useGlobalState must be used inside GlobalState.Provider')
  return context
}

export function GlobalStateProvider() {
  useWatchOnlineStatus()

  const clerk = useClerk()
  const auth = useAuth()
  const rtc = createRtcState()

  const nodes: GlobalState['nodes'] = new Set()
  const keypressed: GlobalState['keypressed'] = {}
  const scene: GlobalState['scene'] = {
    ref: null as unknown as HTMLElement,
    scale: 1,
    worldUnit: { x: 0, y: 0 }, // 0 to 100
    scaled: { width: 0, height: 0 },
    walkableMinX: 0,
    walkableMaxX: 0,
    cameraX: 0,
    cameraStartMovingX: 0,
    cameraEndMovingX: 0,
    s50: 0,
    cameraViewportWidth: 0,
  }

  const [hat, setHat] = createSignal<Hat>('baseball')
  const isAdmin = createMemo(() => !!clerk()?.user?.publicMetadata?.isAdmin)
  createEffect(on(isAdmin, (admin) => admin && setHat('admin')))

  const player: GlobalState['player'] = {
    ref: null as unknown as HTMLElement,
    x: 0,
    realX: 0,
    cameraX: 0,
    cameraMinX: 0,
    cameraMaxX: 0,
    scaled: { width: 0, height: 0 },
    scaledHalf: { width: 0, height: 0 },
    widthInWorldUnits: 0,
    hitboxScaled: { x1: 0, x2: 0, y1: 0, y2: 0 },
    direction: 0,
    isWalking: false,
    isRunning: false,
    facing: 'right',
    speed: PLAYER_BASE_SPEED,
    shouldSendBatches: false,
    hat,
    setHat,
    isAdmin,
  }

  const [otherPlayersIds, setOtherPlayersIds] = createStore({ ids: [] as Id<'users'>[] })
  const { data: onlineUsersList } = useQuery(api.users.listOnlineUsers, {})
  createEffect(
    on(
      () => onlineUsersList() ?? [],
      (list) => setOtherPlayersIds('ids', list),
    ),
  )
  const otherPlayers: GlobalState['otherPlayers'] = {
    hashmap: new Map(),
    list: () => otherPlayersIds.ids,
  }

  const { data: shouldSendBatches } = useQuery(api.gameState.shouldSendRealTimeMovement, {})
  createEffect(
    on(
      () => shouldSendBatches() ?? false,
      (shouldSend) => (player.shouldSendBatches = shouldSend),
    ),
  )

  /** Convex-bounded state that is required to show the proper loading screen state. */
  const getMyInitialState = useMutation(api.gameState.getMyInitialState)
  const allStatesLoaded = createMemo(() => getMyInitialState.data() !== undefined)
  const loadingStatus = createMemo<LoadingStatus>(() => {
    if (auth.userId() === null) return 'signed-out'
    if (allStatesLoaded()) return 'signed-in'
    return clerk().loaded ? 'loading-game-state' : 'loading-clerk'
  })

  function onWindowResize() {
    const root = document.documentElement
    const gameContentHeight = window.innerHeight * GAME_CONTENT_HEIGHT_RATIO
    root.style.setProperty('--window-inner-height', `${window.innerHeight}px`)

    scene.scale = Math.min(gameContentHeight / ORIGINAL_SCENE_SIZE.height, 1) // --scale
    root?.style.setProperty('--scale', `${scene.scale}`)

    scene.scaled.width = ORIGINAL_SCENE_SIZE.width * scene.scale // --scene-width-scaled
    scene.scaled.height = Math.min(gameContentHeight, ORIGINAL_SCENE_SIZE.height) // --scene-height-scaled
    scene.worldUnit.x = scene.scaled.width / 100 // --scene-world-unit-x
    scene.worldUnit.y = scene.scaled.height / 100 // --scene-world-unit-y

    const playableWidth = Math.min(window.innerWidth, scene.scaled.width)
    scene.s50 = playableWidth * 0.5 // 50% of the screen width
    scene.cameraViewportWidth = scene.scaled.width - playableWidth
    scene.cameraStartMovingX = scene.s50
    scene.cameraEndMovingX = scene.scaled.width - scene.s50

    player.scaled.width = PLAYER_SIZE.width * scene.scale // --player-width-scaled
    player.scaled.height = PLAYER_SIZE.height * scene.scale // --player-height-scaled
    player.scaledHalf.width = player.scaled.width / 2
    player.scaledHalf.height = player.scaled.height / 2
    player.widthInWorldUnits = (player.scaledHalf.width / scene.scaled.width) * 100
    player.realX = player.x * scene.worldUnit.x
    player.hitboxScaled.x1 = player.realX - player.scaledHalf.width
    player.hitboxScaled.x2 = player.realX + player.scaled.width
    player.hitboxScaled.y1 = SCENE_PLAYER_OFFSET_Y * scene.worldUnit.y // --player-offset-y-scaled
    player.hitboxScaled.y2 = player.hitboxScaled.y1 + player.scaled.height

    scene.walkableMinX = player.widthInWorldUnits
    scene.walkableMaxX = 100 - player.widthInWorldUnits
    scene.cameraX = clamp(0, player.realX - scene.s50, scene.cameraViewportWidth)

    player.cameraMinX = scene.walkableMinX * scene.worldUnit.x
    player.cameraMaxX = playableWidth - player.scaledHalf.width

    const atStart = player.realX < scene.s50
    const playerViewportX = player.realX - scene.cameraViewportWidth
    const atEnd = player.realX >= scene.s50 && playerViewportX >= scene.s50
    player.cameraX = clamp(
      atStart ? player.cameraMinX : scene.s50,
      atStart ? player.realX : player.realX - scene.cameraViewportWidth,
      atEnd ? player.cameraMaxX : scene.s50,
    )

    for (const [, otherPlayer] of otherPlayers.hashmap) {
      otherPlayer.scaled.width = player.scaled.width
      otherPlayer.scaled.height = player.scaled.height
      otherPlayer.scaledHalf.width = player.scaledHalf.width
      otherPlayer.scaledHalf.height = player.scaledHalf.height
      otherPlayer.realX = otherPlayer.x * scene.worldUnit.x
      otherPlayer.hitboxScaled.x1 = otherPlayer.realX - otherPlayer.scaledHalf.width
      otherPlayer.hitboxScaled.x2 = otherPlayer.realX + otherPlayer.scaledHalf.width
      otherPlayer.hitboxScaled.y1 = player.hitboxScaled.y1
      otherPlayer.hitboxScaled.y2 = player.hitboxScaled.y2
    }

    for (const node of nodes) {
      node.hitboxScaled.x1 = node.hitbox.x1 * scene.worldUnit.x
      node.hitboxScaled.x2 = node.hitbox.x2 * scene.worldUnit.x
      node.hitboxScaled.y1 = node.hitbox.y1 * scene.worldUnit.y
      node.hitboxScaled.y2 = node.hitbox.y2 * scene.worldUnit.y
    }

    updatePlayerAnimations()
  }

  function updatePlayerAnimations() {
    player.ref?.style.setProperty('--facing-dir', `${player.facing === 'left' ? -1 : 1}`)
    player.ref?.classList.toggle('player-walk', player.isWalking)
    player.ref?.classList.toggle('player-idle', !player.isWalking)
  }

  const setIsWalking = useMutation(api.gameState.setIsWalking)
  const setIsRunning = useMutation(api.gameState.setIsRunning)
  const setDirection = useMutation(api.gameState.setDirection)

  function onKeyDown(e: KeyboardEvent) {
    if (isInteractiveElement() || keypressed[e.code]) return

    keypressed[e.code] = true
    const prevIsRunning = player.isRunning
    const prevIsWalking = player.isWalking
    const prevDirection = player.direction

    switch (true) {
      /* Move left */
      case e.code === 'KeyA' || e.code === 'ArrowLeft': {
        player.isWalking = true
        player.facing = 'left'
        player.direction = -1
        break
      }

      /* Move right */
      case e.code === 'KeyD' || e.code === 'ArrowRight': {
        player.isWalking = true
        player.facing = 'right'
        player.direction = 1
        break
      }

      /* Start running */
      case e.key === 'Shift': {
        player.isRunning = true
        player.speed = PLAYER_BASE_SPEED * PLAYER_RUNNING_SPEED_MOD
        player.ref?.style.setProperty('--is-running', '1')
        break
      }
    }

    if (prevIsWalking !== player.isWalking) void setIsWalking.mutate({ isWalking: player.isWalking })
    if (prevIsRunning !== player.isRunning) void setIsRunning.mutate({ isRunning: player.isRunning })

    if (player.direction !== 0 && prevDirection !== player.direction) {
      void setDirection.mutate({ direction: player.direction })
    }

    updatePlayerAnimations()
  }

  function onKeyUp(e: KeyboardEvent) {
    if (isInteractiveElement()) return

    delete keypressed[e.code]
    const prevDirection = player.direction
    const prevIsRunning = player.isRunning

    switch (true) {
      /* Stop moving left */
      case e.code === 'KeyA' || e.code === 'ArrowLeft': {
        player.isWalking = keypressed['KeyD'] || keypressed['ArrowRight'] ? true : false
        if (player.isWalking === false) player.direction = 0
        break
      }

      /* Stop moving right */
      case e.code === 'KeyD' || e.code === 'ArrowRight': {
        player.isWalking = keypressed['KeyA'] || keypressed['ArrowLeft'] ? true : false
        if (player.isWalking === false) player.direction = 0
        break
      }

      /* Stop running */
      case e.key === 'Shift': {
        player.isRunning = false
        player.speed = PLAYER_BASE_SPEED
        player.ref?.style.setProperty('--is-running', '0')
        break
      }
    }

    if (prevDirection !== 0 && player.isWalking === false) void setIsWalking.mutate({ isWalking: false })
    if (prevIsRunning !== player.isRunning) void setIsRunning.mutate({ isRunning: player.isRunning })

    updatePlayerAnimations()
  }

  createEffect(
    on(allStatesLoaded, (shouldRunCalcs) => {
      if (shouldRunCalcs === false) return
      queueMicrotask(() => onWindowResize())
      window.addEventListener('resize', onWindowResize)
      onCleanup(() => window.removeEventListener('resize', onWindowResize))
    }),
  )

  onMount(() => {
    void getMyInitialState.mutate({}).then((s) => {
      player.isWalking = false
      player.direction = 0
      player.facing = s.direction
      player.x = s.x
      onWindowResize()
    })

    const root = document.documentElement
    root.style.setProperty('--game-content-height-ratio', `${GAME_CONTENT_HEIGHT_RATIO}`)
    root.style.setProperty('--original-scene-width', `${ORIGINAL_SCENE_SIZE.width}px`)
    root.style.setProperty('--original-scene-height', `${ORIGINAL_SCENE_SIZE.height}px`)
    root.style.setProperty('--original-player-width', `${PLAYER_SIZE.width}px`)
    root.style.setProperty('--original-player-height', `${PLAYER_SIZE.height}px`)
    root.style.setProperty('--player-offset-y', `${SCENE_PLAYER_OFFSET_Y}`)

    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('keyup', onKeyUp)
    onCleanup(() => {
      document.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('keyup', onKeyUp)
    })
  })

  return (
    <GlobalStateContext.Provider
      value={{
        nodes,
        scene,
        keypressed,
        otherPlayers,
        rtc,
        player,
        loadingStatus,
      }}
    >
      <main class="h-screen w-screen max-w-screen max-h-screen min-w-screen min-h-screen flex items-center overflow-hidden">
        <Show
          when={loadingStatus() !== 'signed-in'}
          fallback={
            <>
              <GameContent />
              <GameUI />
            </>
          }
        >
          <div class="flex items-center justify-center size-full">
            <Switch>
              <Match when={loadingStatus() === 'signed-out'}>
                <SignIn />
              </Match>

              <Match when={loadingStatus() === 'loading-clerk' || loadingStatus() === 'loading-game-state'}>
                <div class="flex flex-col items-center justify-center relative bg-tertiary rounded-full size-75 animate-pulse [--player-width-scaled:150px] [--player-height-scaled:150px]">
                  <div class="relative player player-walk [--tx:calc(50%+0.5em)] [--ty:calc(50%-1em)]" />
                  <span class="text-accent tracking-wide typing">
                    Loading {loadingStatus() === 'loading-clerk' ? 'Clerk' : 'Game State'}
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

function isInteractiveElement() {
  return document.activeElement?.closest('[data-interactive="true"]') != null
}

function useWatchOnlineStatus() {
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
