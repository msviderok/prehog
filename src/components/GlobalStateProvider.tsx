import { api } from '@/convex/api'
import type { Id } from '@/convex/dataModel'
import {
  COMMON_SCENE_HEIGHT,
  EVENT_MARKER_RADIUS,
  GAME_CONTENT_HEIGHT_RATIO,
  HEARTBEAT_MS,
  PLAYER_BASE_SPEED_PX_PER_SEC,
  PLAYER_HITBOX_SIZE,
  PLAYER_RUNNING_SPEED_MOD,
  PLAYER_SIZE,
  SCENE,
  type Hat,
} from '@/lib/constants'
import { clamp } from '@/lib/utils'
import { createHotkeys, createKeyHold, getKeyStateTracker } from '@tanstack/solid-hotkeys'
import { useClerk } from 'clerk-solidjs-tanstack-start'
import { useMutation, useQuery } from 'convex-solidjs'
import {
  createEffect,
  createMemo,
  createSignal,
  on,
  onCleanup,
  onMount,
  type Accessor,
  type ParentProps,
  type Setter,
} from 'solid-js'
import { createStore } from 'solid-js/store'
import { GlobalStateContext } from './GlobalStateContext'
import { createRtcState } from '../lib/createRtcState'
import { useStableQuery } from '@/lib/useStableQuery'
import { useNavigate } from '@tanstack/solid-router'

export interface GlobalState {
  recalculate: () => void

  readonly nodes: Set<SceneNode>
  readonly rtc: ReturnType<typeof createRtcState>
  readonly viewport: {
    width: number
    height: number
    vw: number
    vh: number
  }
  readonly scene: {
    ref: HTMLElement | undefined
    scale: number
    worldUnit: Coords
    originalSize: Size
    scaled: Size
    walkableMinX: number
    walkableMaxX: number
    cameraX: number
    cameraXNormalized: number
    cameraStartMovingX: number
    cameraEndMovingX: number
    s50: number // 50% of the screen width
    /*
     * Scrollable width of the screen to allow free player movement at the first/last 50%
     * of the viewport width at the start/end of the scene
     */
    cameraViewportWidth: number
    currentScene: CurrentScene
  }
  readonly otherPlayers: {
    list: Accessor<Id<'users'>[]>
    hashmap: Map<Id<'users'>, OtherPlayer>
  }
  readonly player: {
    ref: HTMLElement | undefined
    hitbox: {
      inWorldUnits: Hitbox
      inPX: Hitbox
    }
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
  readonly misc: {
    player: {
      size: {
        inWorldUnits: { width: number; height: number; halfWidth: number; halfHeight: number }
        inPX: { width: number; height: number; halfWidth: number; halfHeight: number }
      }
      hitbox: {
        inWorldUnits: { y1: number; y2: number }
        inPX: { y1: number; y2: number }
      }
    }
  }
}

export function GlobalStateProvider(props: ParentProps) {
  useWatchPresence()

  const clerk = useClerk()
  const rtc = createRtcState()
  const navigate = useNavigate()

  const nodes: GlobalState['nodes'] = new Set()
  const viewport: GlobalState['viewport'] = { width: 0, height: 0, vw: 0, vh: 0 }
  const misc: GlobalState['misc'] = {
    player: {
      size: {
        inWorldUnits: { width: 0, height: 0, halfWidth: 0, halfHeight: 0 },
        inPX: { width: 0, height: 0, halfWidth: 0, halfHeight: 0 },
      },
      hitbox: {
        inWorldUnits: { y1: 0, y2: 0 },
        inPX: { y1: 0, y2: 0 },
      },
    },
  }

  const { data: currentScene } = useStableQuery(api.gameState.currentScene)
  const scene: GlobalState['scene'] = {
    ref: null as unknown as HTMLElement,
    scale: 1,
    worldUnit: { x: 0, y: 0 }, // scaled/100 in px
    originalSize: { width: 0, height: 0 },
    scaled: { width: 0, height: 0 },
    walkableMinX: 0,
    walkableMaxX: 0,
    cameraX: 0,
    cameraXNormalized: 0,
    cameraStartMovingX: 0,
    cameraEndMovingX: 0,
    s50: 0,
    cameraViewportWidth: 0,
    currentScene: 'main',
  }
  createEffect(
    on(currentScene, (sceneValue) => {
      if (sceneValue == null) return
      const sceneInitialState = SCENE[sceneValue]

      misc.player.size.inWorldUnits.width = (PLAYER_HITBOX_SIZE.width / sceneInitialState.width) * 100
      misc.player.size.inWorldUnits.height = (PLAYER_HITBOX_SIZE.height / sceneInitialState.height) * 100
      misc.player.size.inWorldUnits.halfWidth = misc.player.size.inWorldUnits.width / 2
      misc.player.size.inWorldUnits.halfHeight = misc.player.size.inWorldUnits.height / 2
      misc.player.hitbox.inWorldUnits.y1 = sceneInitialState.playerInitialY
      misc.player.hitbox.inWorldUnits.y2 = sceneInitialState.playerInitialY + misc.player.size.inWorldUnits.height

      scene.originalSize.width = sceneInitialState.width
      scene.originalSize.height = sceneInitialState.height
      scene.walkableMinX = misc.player.size.inWorldUnits.halfWidth
      scene.walkableMaxX = 100 - misc.player.size.inWorldUnits.halfWidth

      player.hitbox.inWorldUnits.y1 = misc.player.hitbox.inWorldUnits.y1
      player.hitbox.inWorldUnits.y2 = misc.player.hitbox.inWorldUnits.y2

      const root = document.documentElement
      root.style.setProperty('--original-scene-width', `${scene.originalSize.width}px`)
      root.style.setProperty('--original-scene-height', `${scene.originalSize.height}px`)
      root.style.setProperty('--player-offset-y', `${sceneInitialState.playerInitialY}`)

      navigate({ to: `/${sceneValue}` })
      queueMicrotask(() => calculate())
    }),
  )

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
    hitbox: {
      inWorldUnits: { x1: 0, x2: 0, y1: 0, y2: 0 },
      inPX: { x1: 0, x2: 0, y1: 0, y2: 0 },
    },
    direction: 0,
    isWalking: false,
    isRunning: false,
    facing: 'right',
    speed: PLAYER_BASE_SPEED_PX_PER_SEC,
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

  function calculate() {
    const root = document.documentElement
    const gameContentHeight = window.innerHeight * GAME_CONTENT_HEIGHT_RATIO
    root.style.setProperty('--window-inner-height', `${window.innerHeight}px`)

    viewport.width = window.innerWidth
    viewport.height = window.innerHeight
    viewport.vw = viewport.width / 100
    viewport.vh = viewport.height / 100

    scene.scale = Math.min(gameContentHeight / COMMON_SCENE_HEIGHT, 1) // --scale
    root?.style.setProperty('--scale', `${scene.scale}`)

    scene.scaled.width = scene.originalSize.width * scene.scale // --scene-width-scaled
    scene.scaled.height = Math.min(gameContentHeight, scene.originalSize.height) // --scene-height-scaled
    scene.worldUnit.x = scene.scaled.width / 100 // --scene-world-unit-x
    scene.worldUnit.y = scene.scaled.height / 100 // --scene-world-unit-y

    const playableWidth = Math.min(window.innerWidth, scene.scaled.width)
    scene.s50 = playableWidth / 2 // 50% of the screen width
    scene.cameraViewportWidth = scene.scaled.width - playableWidth
    scene.cameraStartMovingX = scene.s50
    scene.cameraEndMovingX = scene.scaled.width - scene.s50

    misc.player.size.inPX.width = misc.player.size.inWorldUnits.width * scene.worldUnit.x // --player-width-scaled
    misc.player.size.inPX.height = misc.player.size.inWorldUnits.height * scene.worldUnit.y // --player-height-scaled
    misc.player.size.inPX.halfWidth = misc.player.size.inPX.width / 2
    misc.player.size.inPX.halfHeight = misc.player.size.inPX.height / 2
    misc.player.hitbox.inPX.y1 = misc.player.hitbox.inWorldUnits.y1 * scene.worldUnit.y // --player-offset-y-scaled
    misc.player.hitbox.inPX.y2 = misc.player.hitbox.inPX.y1 + misc.player.size.inPX.height

    player.realX = player.x * scene.worldUnit.x
    player.hitbox.inPX.x1 = player.realX - misc.player.size.inPX.halfWidth
    player.hitbox.inPX.x2 = player.realX + misc.player.size.inPX.halfWidth
    player.cameraMinX = scene.walkableMinX * scene.worldUnit.x
    player.cameraMaxX = playableWidth - misc.player.size.inPX.halfWidth

    scene.cameraX = clamp(0, player.realX - scene.s50, scene.cameraViewportWidth)

    const atStart = player.realX < scene.s50
    const playerViewportX = player.realX - scene.cameraViewportWidth
    const atEnd = player.realX >= scene.s50 && playerViewportX >= scene.s50
    player.cameraX = clamp(
      atStart ? player.cameraMinX : scene.s50,
      atStart ? player.realX : player.realX - scene.cameraViewportWidth,
      atEnd ? player.cameraMaxX : scene.s50,
    )

    for (const [, otherPlayer] of otherPlayers.hashmap) {
      otherPlayer.realX = otherPlayer.x * scene.worldUnit.x
    }

    for (const node of nodes) {
      if (node.type === 'popover') {
        const r = 20 / viewport.vh
        console.log(viewport.vh, r)
        node.hitbox.inWorldUnits.x1 = node.hitbox.position.x - r
        node.hitbox.inWorldUnits.x2 = node.hitbox.position.x + r
        node.hitbox.inWorldUnits.y1 = node.hitbox.position.y - r
        node.hitbox.inWorldUnits.y2 = node.hitbox.position.y + r

        node.rootRef?.style.setProperty('--node-hitbox-x1', `${node.hitbox.inWorldUnits.x1}`)
        node.rootRef?.style.setProperty('--node-hitbox-x2', `${node.hitbox.inWorldUnits.x2}`)
        node.rootRef?.style.setProperty('--node-hitbox-y1', `${node.hitbox.inWorldUnits.y1}`)
        node.rootRef?.style.setProperty('--node-hitbox-y2', `${node.hitbox.inWorldUnits.y2}`)
      }

      node.hitbox.inPX.x1 = node.hitbox.inWorldUnits.x1 * scene.worldUnit.x
      node.hitbox.inPX.x2 = node.hitbox.inWorldUnits.x2 * scene.worldUnit.x
      node.hitbox.inPX.y1 = node.hitbox.inWorldUnits.y1 * scene.worldUnit.y
      node.hitbox.inPX.y2 = node.hitbox.inWorldUnits.y2 * scene.worldUnit.y
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
  const isShiftHeld = createKeyHold('Shift')
  const keytracker = getKeyStateTracker()

  function updateGameStateIfChanged(cb: () => void) {
    return () => {
      const prevIsRunning = player.isRunning
      const prevIsWalking = player.isWalking
      const prevDirection = player.direction

      cb()
      updatePlayerAnimations()

      if (prevIsWalking !== player.isWalking) {
        void setIsWalking.mutate({ isWalking: player.isWalking })
      }
      if (prevIsRunning !== player.isRunning) {
        void setIsRunning.mutate({ isRunning: player.isRunning })
      }
      if (player.direction !== 0 && prevDirection !== player.direction) {
        void setDirection.mutate({ direction: player.direction })
      }
    }
  }

  const startMovingLeft = updateGameStateIfChanged(() => {
    player.isWalking = true
    player.facing = 'left'
    player.direction = -1
  })

  const stopMovingLeft = updateGameStateIfChanged(() => {
    player.isWalking = keytracker.isKeyHeld('D') || keytracker.isKeyHeld('ArrowRight') ? true : false
    if (player.isWalking === false) player.direction = 0
  })

  const startMovingRight = updateGameStateIfChanged(() => {
    player.isWalking = true
    player.facing = 'right'
    player.direction = 1
  })

  const stopMovingRight = updateGameStateIfChanged(() => {
    player.isWalking = keytracker.isKeyHeld('A') || keytracker.isKeyHeld('ArrowLeft') ? true : false
    if (player.isWalking === false) player.direction = 0
  })

  createHotkeys(
    [
      { hotkey: 'A', callback: startMovingLeft, options: { eventType: 'keydown' } },
      { hotkey: 'Shift+A', callback: startMovingLeft, options: { eventType: 'keydown' } },
      { hotkey: 'ArrowLeft', callback: startMovingLeft, options: { eventType: 'keydown' } },
      { hotkey: 'Shift+ArrowLeft', callback: startMovingLeft, options: { eventType: 'keydown' } },

      { hotkey: 'A', callback: stopMovingLeft, options: { eventType: 'keyup' } },
      { hotkey: 'Shift+A', callback: stopMovingLeft, options: { eventType: 'keyup' } },
      { hotkey: 'ArrowLeft', callback: stopMovingLeft, options: { eventType: 'keyup' } },
      { hotkey: 'Shift+ArrowLeft', callback: stopMovingLeft, options: { eventType: 'keyup' } },

      /* Move right */
      { hotkey: 'D', callback: startMovingRight, options: { eventType: 'keydown' } },
      { hotkey: 'Shift+D', callback: startMovingRight, options: { eventType: 'keydown' } },
      { hotkey: 'ArrowRight', callback: startMovingRight, options: { eventType: 'keydown' } },
      { hotkey: 'Shift+ArrowRight', callback: startMovingRight, options: { eventType: 'keydown' } },

      { hotkey: 'D', callback: stopMovingRight, options: { eventType: 'keyup' } },
      { hotkey: 'Shift+D', callback: stopMovingRight, options: { eventType: 'keyup' } },
      { hotkey: 'ArrowRight', callback: stopMovingRight, options: { eventType: 'keyup' } },
      { hotkey: 'Shift+ArrowRight', callback: stopMovingRight, options: { eventType: 'keyup' } },
    ],
    { requireReset: true, conflictBehavior: 'allow' },
  )

  createEffect(
    on(isShiftHeld, (shift) => {
      player.isRunning = shift
      player.speed = PLAYER_BASE_SPEED_PX_PER_SEC * (shift ? PLAYER_RUNNING_SPEED_MOD : 1)
      player.ref?.style.setProperty('--is-running', shift ? '1' : '0')
    }),
  )

  onMount(() => {
    const root = document.documentElement
    root.style.setProperty('--game-content-height-ratio', `${GAME_CONTENT_HEIGHT_RATIO}`)
    root.style.setProperty('--original-player-width', `${PLAYER_SIZE.width}px`)
    root.style.setProperty('--original-player-height', `${PLAYER_SIZE.height}px`)
    root.style.setProperty('--original-player-hitbox-width', `${PLAYER_HITBOX_SIZE.width}px`)
    root.style.setProperty('--original-player-hitbox-height', `${PLAYER_HITBOX_SIZE.height}px`)
  })

  return (
    <GlobalStateContext.Provider
      value={{
        recalculate: calculate,
        nodes,
        scene,
        otherPlayers,
        rtc,
        player,
        misc,
        viewport,
      }}
    >
      {props.children}
    </GlobalStateContext.Provider>
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
