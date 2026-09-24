import { api } from '@/convex/api'
import type { Id } from '@/convex/dataModel'
import {
  COMMON_SCENE_HEIGHT,
  EVENT_MARKER_SIZE,
  GAME_CONTENT_HEIGHT_RATIO,
  PLAYER_HITBOX_SIZE,
  PLAYER_SIZE,
  SCENE,
  type Hat,
} from '@/lib/constants'
import { useStableQuery } from '@/lib/useStableQuery'
import { createHotkeys, createKeyHold, getKeyStateTracker } from '@tanstack/solid-hotkeys'
import { useNavigate } from '@tanstack/solid-router'
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
import { createRtcState } from '../../../lib/createRtcState'
import { GlobalStateContext } from './GlobalStateContext'

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
    /** Ref to the scene container element */
    ref: HTMLElement | undefined
    /** Ref to the scene background element */
    backgroundRef: HTMLElement | undefined
    /** Ref to the scene popup container element */
    popupContainerRef: HTMLElement | undefined
    /** Ref to the scene elements container element */
    elementsContainerRef: HTMLElement | undefined
    /**
     * Scale of the scene calculated by the formula:
     * Math.min(gameContentHeight / COMMON_SCENE_HEIGHT, 1)
     */
    scale: number
    /** The size of a single world unit in px */
    worldUnit: { x: number; y: number }
    /** The original size of the scene in px */
    originalSize: { width: number; height: number }
    /** `DEBUG ONLY`: The scaled size of the scene in px. */
    scaledSize: { width: number; height: number }
    /** Min world unit X of the scene the player should be able to move to */
    walkableMinX: number
    /** Max world unit X of the scene the player should be able to move to */
    walkableMaxX: number
    /** The current position of the viewport a.k.a. "camera" showing the portion of the scene in world units */
    tx: number
    cameraCenterAtX: number
    /** 50% of the current viewport width in world units */
    s50PX: number
    s50WU: number
    cameraStartTravelAtX: number
    cameraEndTravelAtX: number
    /** The current scene the player is in */
    currentScene: CurrentScene
  }
  readonly otherPlayers: {
    list: Accessor<Array<Id<'users'>>>
    hashmap: Map<Id<'users'>, OtherPlayer>
  }
  readonly player: {
    ref: HTMLElement | undefined
    hitbox: { x1: number; y1: number; x2: number; y2: number }
    x: number
    tx: number
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
      size: { width: number; height: number; halfWidth: number; halfHeight: number }
      hitbox: { y1: number; y2: number }
    }
    eventMarker: { r: number; h: number }
  }
  debugData: Accessor<DebugData>
}

type DebugData = Pick<GlobalState, 'scene' | 'player'>

export function GlobalStateProvider(props: ParentProps) {
  const clerk = useClerk()
  const rtc = createRtcState()
  const navigate = useNavigate()

  const nodes: GlobalState['nodes'] = new Set()
  const viewport: GlobalState['viewport'] = { width: 0, height: 0, vw: 0, vh: 0 }
  const misc: GlobalState['misc'] = {
    player: {
      size: { width: 0, height: 0, halfWidth: 0, halfHeight: 0 },
      hitbox: { y1: 0, y2: 0 },
    },
    eventMarker: { r: 0, h: 0 },
  }

  const { data: currentScene } = useStableQuery(api.gameState.currentScene)
  const scene: GlobalState['scene'] = {
    ref: null as unknown as HTMLElement,
    backgroundRef: null as unknown as HTMLElement,
    popupContainerRef: null as unknown as HTMLElement,
    elementsContainerRef: null as unknown as HTMLElement,
    scale: 1,
    worldUnit: { x: 0, y: 0 }, // scaled/100 in px
    originalSize: { width: 0, height: 0 },
    scaledSize: { width: 0, height: 0 },
    walkableMinX: 0,
    walkableMaxX: 0,
    tx: 0,
    cameraCenterAtX: 0,
    s50PX: 0,
    s50WU: 0,
    cameraStartTravelAtX: 0,
    cameraEndTravelAtX: 0,
    currentScene: 'main',
  }
  createEffect(
    on([() => currentScene()?.scene, () => currentScene()?.lastKnownXPosition], ([sceneValue, lastKnownX]) => {
      if (sceneValue == null) return

      const root = document.documentElement
      const sceneInitialState = SCENE[sceneValue]

      misc.player.size.width = (PLAYER_HITBOX_SIZE.width / sceneInitialState.width) * 100
      misc.player.size.height = (PLAYER_HITBOX_SIZE.height / sceneInitialState.height) * 100
      misc.player.size.halfWidth = misc.player.size.width / 2
      misc.player.size.halfHeight = misc.player.size.height / 2
      console.log(misc.player.size)
      root.style.setProperty('--original-player-width', `${PLAYER_SIZE.width}px`)
      root.style.setProperty('--original-player-height', `${PLAYER_SIZE.height}px`)
      root.style.setProperty('--original-player-hitbox-width', `${PLAYER_HITBOX_SIZE.width}px`)
      root.style.setProperty('--original-player-hitbox-height', `${PLAYER_HITBOX_SIZE.height}px`)

      misc.player.hitbox.y1 = sceneInitialState.playerInitialY - misc.player.size.halfHeight
      misc.player.hitbox.y2 = sceneInitialState.playerInitialY + misc.player.size.halfHeight
      root.style.setProperty('--player-offset-y', `${sceneInitialState.playerInitialY}`)

      misc.eventMarker.r = EVENT_MARKER_SIZE.width / scene.worldUnit.x
      misc.eventMarker.h = EVENT_MARKER_SIZE.height / scene.worldUnit.y

      scene.originalSize.width = sceneInitialState.width
      scene.originalSize.height = sceneInitialState.height
      root.style.setProperty('--original-scene-width', `${scene.originalSize.width}px`)
      root.style.setProperty('--original-scene-height', `${scene.originalSize.height}px`)

      scene.worldUnit.x = scene.originalSize.width / 100
      scene.worldUnit.y = scene.originalSize.height / 100
      root.style.setProperty('--wux', `${scene.worldUnit.x}px`)
      root.style.setProperty('--wuy', `${scene.worldUnit.y}px`)

      scene.walkableMinX = misc.player.size.halfWidth
      scene.walkableMaxX = 100 - misc.player.size.halfWidth

      player.x = lastKnownX ?? sceneInitialState.playerInitialX
      player.hitbox.x1 = sceneInitialState.playerInitialX
      player.hitbox.x2 = sceneInitialState.playerInitialX + misc.player.size.width
      player.hitbox.y1 = misc.player.hitbox.y1
      player.hitbox.y2 = misc.player.hitbox.y2

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
    tx: 0,
    hitbox: { x1: 0, x2: 0, y1: 0, y2: 0 },
    direction: 0,
    isWalking: false,
    isRunning: false,
    facing: 'right',
    speed: 1,
    shouldSendBatches: false,
    hat,
    setHat,
    isAdmin,
  }

  const [otherPlayersIds, setOtherPlayersIds] = createStore({ ids: [] as Array<Id<'users'>> })
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
    viewport.width = window.innerWidth
    viewport.height = window.innerHeight
    viewport.vw = viewport.width / 100
    viewport.vh = viewport.height / 100

    const root = document.documentElement
    const gameContentHeight = window.innerHeight * GAME_CONTENT_HEIGHT_RATIO
    scene.scale = Math.min(gameContentHeight / COMMON_SCENE_HEIGHT, 1)
    root?.style.setProperty('--scale', `${scene.scale}`)

    scene.scaledSize.width = scene.originalSize.width * scene.scale
    scene.scaledSize.height = scene.originalSize.height * scene.scale
    scene.s50PX = Math.min(window.innerWidth, scene.scaledSize.width) / 2
    scene.s50WU = (scene.s50PX / scene.scaledSize.width) * 100
    scene.cameraStartTravelAtX = scene.s50WU
    scene.cameraEndTravelAtX = 100 - scene.s50WU

    for (const node of nodes) {
      if (node.type === 'popover') {
        node.hitbox.x1 = node.position.x - misc.eventMarker.r
        node.hitbox.x2 = node.position.x + misc.eventMarker.r
        node.hitbox.y1 = node.position.y - misc.eventMarker.h
        node.hitbox.y2 = node.position.y + misc.eventMarker.h
        node.size.width = node.hitbox.x2 - node.hitbox.x1
        node.size.height = node.hitbox.y2 - node.hitbox.y1
      }

      if (node.type === 'popover') {
        node.rootRef?.style.setProperty('--node-tx', `${node.hitbox.x1}`)
        node.rootRef?.style.setProperty('--node-ty', `${node.hitbox.y1}`)
        node.rootRef?.style.setProperty('--node-width', `${node.size.width}`)
        node.rootRef?.style.setProperty('--node-height', `${node.size.height}`)
      }
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
      const prevIsWalking = player.isWalking
      const prevDirection = player.direction

      cb()
      updatePlayerAnimations()

      if (prevIsWalking !== player.isWalking) {
        void setIsWalking.mutate({ isWalking: player.isWalking })
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
      player.speed = shift ? 2.0 : 1.0
      player.ref?.style.setProperty('--is-running', shift ? '1' : '0')
      void setIsRunning.mutate({ isRunning: player.isRunning })
    }),
  )

  onMount(() => {
    const root = document.documentElement
    root.style.setProperty('--game-content-height-ratio', `${GAME_CONTENT_HEIGHT_RATIO}`)
  })

  if (import.meta.hot) {
    import.meta.hot.on('vite:afterUpdate', () => {
      calculate()
    })
  }

  const [debugData, setDebugData] = createSignal<DebugData>({ scene, player })
  const getScene = () => scene
  const getPlayer = () => player

  onMount(() => {
    const i = setInterval(() => {
      const s = getScene()
      const p = getPlayer()
      setDebugData({ scene: s, player: p })
    }, 100)
    onCleanup(() => clearInterval(i))
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
        debugData,
      }}
    >
      {props.children}
    </GlobalStateContext.Provider>
  )
}
