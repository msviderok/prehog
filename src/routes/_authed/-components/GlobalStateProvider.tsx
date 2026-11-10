import { SOUNDS } from '@/audio'
import { api } from '@/convex/api'
import {
  PLAYER_JUMP_ANIMATION_MS,
  PLAYER_JUMP_END_ANIMATION_MS,
  PLAYER_JUMP_END_DRAMATIC_ANIMATION_MS,
  PLAYER_JUMP_START_ANIMATION_MS,
} from '@/lib/constants'
import { useStableQuery } from '@/lib/useStableQuery'
import { Dialog as DialogPrimitive } from '@msviderok/base-ui-solid/dialog'
import { Popover as PopoverPrimitive } from '@msviderok/base-ui-solid/popover'
import { debounce } from '@solid-primitives/scheduled'
import { createHeldKeys, createHotkey } from '@tanstack/solid-hotkeys'
import { useBlocker } from '@tanstack/solid-router'
import { useClerk } from 'clerk-solidjs-tanstack-start'
import { useMutation, useQuery } from 'convex-solidjs'
import type { FunctionReturnType } from 'convex/server'
import { batch, createEffect, createMemo, createSignal, ErrorBoundary, on, Show, type ParentProps } from 'solid-js'
import { createRtcState } from '../../../lib/createRtcState'
import { GameState, getCameraOffset } from './GameState'
import { GlobalStateContext, useGlobalState } from './GlobalStateContext'
import { Loading } from './Loading'
import { useGameLoop } from './useGameLoop'
import { useWatchPresence } from './useWatchPresence'

type InitialState = FunctionReturnType<typeof api.gameState.getMyInitialState>

export function GameEngine(props: ParentProps) {
  const { data: myPlayerInitialState } = useQuery(api.gameState.getMyInitialState, {})
  const isMyPlayerStateLoaded = createMemo(() => myPlayerInitialState() !== undefined)

  return (
    <ErrorBoundary
      fallback={(err, _reset) => {
        console.log('🔴')
        console.error(err)
      }}
    >
      <Show when={isMyPlayerStateLoaded()} fallback={<Loading type="convex" />}>
        <GlobalStateProvider initialState={myPlayerInitialState()!}>{props.children}</GlobalStateProvider>
      </Show>
    </ErrorBoundary>
  )
}

function GlobalStateProvider(props: ParentProps<{ initialState: InitialState }>) {
  const rtc = createRtcState()
  const player = createPlayer(props.initialState)
  const popover = createPopover()
  const dialog = createDialog()
  const scene = createScene()
  const interaction = createInteraction({ player, dialog })
  const { data: otherPlayersIds } = useStableQuery(api.users.listOnlineUsers, {}, { initialData: [] })
  const gameState = new GameState({ globalState: { player, scene }, initialState: props.initialState })
  const animations: GlobalState['animations'] = { enterMarker: async () => {} }

  if (import.meta.hot) {
    import.meta.hot.on('vite:afterUpdate', () => {
      gameState.updateSceneCssVariables()
    })
  }

  return (
    <GlobalStateContext.Provider
      value={{
        gameState,
        scene,
        rtc,
        player,
        popover,
        dialog,
        interaction,
        otherPlayersIds,
        animations,
      }}
    >
      <DialogPrimitive.Root
        data-slot="dialog"
        modal="trap-focus"
        open={dialog.isOpen()}
        dismissible={false}
        onOpenChange={(open, _e, reason) => {
          console.log(open, reason)
          if (reason === 'escape-key') return
        }}
      >
        <PopoverPrimitive.Root open={popover.isOpen()}>
          <GameInnerImplementaion>
            {props.children}
            {/*<GameUI />*/}
          </GameInnerImplementaion>
        </PopoverPrimitive.Root>
      </DialogPrimitive.Root>
    </GlobalStateContext.Provider>
  )
}

function GameInnerImplementaion(props: ParentProps) {
  useGameLoop()
  useWatchPresence()
  useKeyboardManager()
  useAnimationManager()

  useBlocker({
    enableBeforeUnload: false,
    shouldBlockFn: ({ action }) => {
      if (action === 'BACK' || action === 'FORWARD') return true
      return false
    },
  })

  return <>{props.children}</>
}

function createPlayer(initialState: InitialState) {
  const clerk = useClerk()
  const isAdmin = createMemo(() => !!clerk()?.user?.publicMetadata?.isAdmin)
  const [hat, setHat] = createSignal<number>(initialState.hat)
  const [skin, setSkin] = createSignal(initialState.skin)
  const [isWalking, setIsWalking] = createSignal(false)
  const [isRunning, setIsRunning] = createSignal(false)
  const [direction, setDirection] = createSignal<MovementDirection>(0)
  const [facingDirection, setFacingDirection] = createSignal<FacingDirection>(initialState.direction)
  const [renderedSlotRef, setRenderedSlotRef] = createSignal<HTMLElement>()
  const [action, setAction] = createSignal<MyPlayerAction>('idle')
  const [locked, setLocked] = createSignal(false)
  const isJumping = createMemo(() => action().startsWith('jump-'))
  const player: GlobalState['player'] = {
    x: 0,
    ref: undefined,
    renderedSlotRef,
    setRenderedSlotRef,
    isWalking,
    setIsWalking,
    isRunning,
    setIsRunning,
    isJumping,
    action,
    setAction,
    isAdmin,
    hat,
    setHat,
    skin,
    setSkin,
    direction,
    setDirection,
    facingDirection,
    isLocked: locked,
    setLocked,
    __gameloop: {
      tx: 0,
      direction: 0,
      speed: 1,
      hitbox: { x1: 0, x2: 0, y1: 0, y2: 0 },
      shouldSendBatches: false,
      isHijacked: false,
      lastPosition: null,
      paused: false,
    },
    setInitialData(data) {
      batch(() => {
        player.x = data.x
        setHat(data.hat)
        setSkin(data.skin)
        setDirection(0)
        setFacingDirection(data.direction)
      })
    },
    playAnimation: {
      jump() {
        player.setAction('jump-start')
        debounce(() => {
          player.setAction('jump-end')
          debounce(() => {
            player.setAction(player.isWalking() ? 'walk' : 'idle')
          }, PLAYER_JUMP_END_ANIMATION_MS)()
        }, PLAYER_JUMP_START_ANIMATION_MS)()
      },
    },
    updateTx(sceneCache) {
      player.__gameloop.tx = (player.x - getCameraOffset(player, sceneCache)) * sceneCache.static.worldUnitX
      player.ref?.style.setProperty('--tx', `${Math.round(player.__gameloop.tx)}px`)
    },
    updatePosition(newPlayerX, sceneCache) {
      player.x = newPlayerX
      player.__gameloop.hitbox.x1 = player.x - sceneCache.static.playerHalfWidth
      player.__gameloop.hitbox.x2 = player.x + sceneCache.static.playerHalfWidth
      this.updateTx(sceneCache)
    },
    updateForNewScene(sceneCache, lastKnownX) {
      player.x = lastKnownX ?? sceneCache.static.initialPositionOnSceneX ?? 0
      player.__gameloop.hitbox.y1 = sceneCache.static.playerHitboxY1
      player.__gameloop.hitbox.y2 = sceneCache.static.playerHitboxY2
      player.__gameloop.hitbox.x1 = sceneCache.static.initialPositionOnSceneX
      player.__gameloop.hitbox.x2 = sceneCache.static.initialPositionOnSceneX + sceneCache.static.playerWidth
      this.updateTx(sceneCache)
    },
  }

  createEffect(
    on(player.direction, (dir) => {
      player.__gameloop.direction = dir
      if (dir === -1) setFacingDirection('left')
      else if (dir === 1) setFacingDirection('right')
    }),
  )

  createEffect(
    on(player.isLocked, (isLocked) => {
      player.__gameloop.isHijacked = isLocked
    }),
  )

  const { data: currentHat } = useQuery(api.gameState.getMyHat, {}, { initialData: initialState.hat })
  createEffect(
    on(currentHat, (h) => {
      console.log(h)
      if (h != null && h !== player.hat()) setHat(h)
    }),
  )

  const { data: currentSkin } = useQuery(api.gameState.getMySkin, {}, { initialData: initialState.skin })
  createEffect(
    on(currentSkin, (s) => {
      if (s != null && s !== player.skin()) setSkin(s)
    }),
  )

  const { data: shouldSendBatches } = useQuery(api.gameState.shouldSendRealTimeMovement, {}, { initialData: false })
  createEffect(
    on(shouldSendBatches, (shouldSend) => {
      player.__gameloop.shouldSendBatches = shouldSend!
    }),
  )

  return player
}

function createInteraction(props: Pick<GlobalState, 'player' | 'dialog'>) {
  const [hostRef, setHostRef] = createSignal<HTMLElement>()
  const [data, setData] = createSignal<InteractionData>({ type: 'idle' })
  const isInteractionActive = createMemo(() => data().type !== 'idle')

  const interaction: GlobalState['interaction'] = {
    hostRef,
    setHostRef,
    isActive: isInteractionActive,
    data,
    setData,
    start(initialData) {
      switch (initialData.type) {
        case 'marker-enter': {
          debounce(() => props.dialog.open(initialData.nodeId), PLAYER_JUMP_ANIMATION_MS)()
          if (initialData.isDrama) {
            const dramaticMusic = SOUNDS.music.dramatic
            debounce(() => dramaticMusic?.play(), PLAYER_JUMP_END_ANIMATION_MS)()
            debounce(() => dramaticMusic?.stop(), PLAYER_JUMP_END_DRAMATIC_ANIMATION_MS)()
          }
          break
        }
      }

      setData(initialData)
    },
    finish() {
      batch(() => {
        setData({ type: 'idle' })
        if (props.dialog.isOpen()) props.dialog.close()
      })
    },
  }

  createEffect(
    on(interaction.data, (currentInteraction) => {
      const root = document.documentElement
      switch (currentInteraction.type) {
        case 'marker-enter':
        case 'scene-change': {
          root.classList.add('marker-enter')
          break
        }

        default:
          root.classList.remove('marker-enter')
      }
    }),
  )

  return interaction
}

function createPopover(): GlobalState['popover'] {
  const [activeNodeId, setActiveNodeId] = createSignal<string>()
  const [prevActiveNodeId, setPrevActiveNodeId] = createSignal<string>()
  const isOpen = createMemo(() => activeNodeId() != null)

  function setActiveNode(id: string | undefined) {
    batch(() => {
      setPrevActiveNodeId(activeNodeId())
      setActiveNodeId(id)
    })
  }

  return {
    isOpen,
    activeNodeId,
    prevActiveNodeId,
    setActiveNode,
  }
}

function createDialog(): GlobalState['dialog'] {
  const [activeNodeId, setActiveNodeId] = createSignal<string>()
  return {
    activeNodeId,
    isOpen: createMemo(() => activeNodeId() != null),
    open(id) {
      return setActiveNodeId(id)
    },
    close() {
      return setActiveNodeId(undefined)
    },
  }
}

function createScene(): GlobalState['scene'] {
  const [viewportRef, setViewportRef] = createSignal<HTMLDivElement>()
  const scene: GlobalState['scene'] = {
    ref: null as unknown as HTMLElement,
    backgroundRef: null as unknown as HTMLElement,
    popupContainerRef: null as unknown as HTMLElement,
    elementsContainerRef: null as unknown as HTMLElement,
    viewportRef,
    setViewportRef,
    tx: 0,
    centerCameraAtPlayer(player: MyPlayer, sceneCache: SceneCache) {
      const cameraLeftX = getCameraOffset(player, sceneCache)
      scene.tx = cameraLeftX * sceneCache.static.worldUnitX
      scene.ref?.style.setProperty('--scene-tx', `${-Math.round(scene.tx)}px`)
    },
  }
  return scene
}

function useKeyboardManager(): void {
  const { player } = useGlobalState()
  const updateIsWalking = useMutation(api.gameState.setIsWalking)
  const updateIsRunning = useMutation(api.gameState.setIsRunning)
  const updateDirection = useMutation(api.gameState.setDirection)

  const heldKeys = createHeldKeys()
  createEffect(
    on(
      () => heldKeys(),
      (held) => {
        if (player.isLocked()) return

        const keys = new Set(held.map((k) => k.toLowerCase()))
        const left = keys.has('a') || keys.has('arrowleft')
        const right = keys.has('d') || keys.has('arrowright')
        const walking = left || right
        const running = keys.has('shift')
        const direction = left === right ? 0 : left ? -1 : 1

        const prevWalking = player.isWalking()
        const prevRunning = player.isRunning()
        const prevDirection = player.direction()

        batch(() => {
          player.setIsWalking(walking)
          player.setIsRunning(running)
          player.setDirection(direction)
          player.setAction(walking ? 'walk' : 'idle')
          player.__gameloop.speed = running ? 2 : 1
        })

        if (prevWalking !== walking) {
          void updateIsWalking.mutate({ isWalking: walking })
        }
        if (prevRunning !== running) {
          void updateIsRunning.mutate({ isRunning: running })
        }
        if (direction !== 0 && prevDirection !== direction) {
          void updateDirection.mutate({ direction: direction })
        }
      },
    ),
  )

  createHotkey(
    'Space',
    () => {
      if (player.isJumping()) return
      let timeout: NodeJS.Timeout
      batch(() => {
        player.setAction('jump-start')
        timeout = setTimeout(() => {
          player.setAction('jump-end')
          clearTimeout(timeout)
          timeout = setTimeout(() => {
            player.setAction(player.isWalking() ? 'walk' : 'idle')
            clearTimeout(timeout)
          }, PLAYER_JUMP_END_ANIMATION_MS)
        }, PLAYER_JUMP_START_ANIMATION_MS)
      })
    },
    {
      requireReset: true,
      conflictBehavior: 'allow',
      get enabled() {
        return player.isLocked() === false
      },
    },
  )
}

function useAnimationManager() {
  const { player, gameState, animations } = useGlobalState()

  animations.enterMarker = async (nodeId, isDrama) => {
    return new Promise<void>((res) => {
      player.setLocked(true)
      // player.setAction('jump-start')
      document.documentElement.classList.add('marker-enter')

      if (isDrama) player.ref?.style.setProperty('--is-dramatic', '1')

      debounce(() => {
        // player.setAction('jump-midair')
        debounce(() => {
          // player.setAction('jump-end')
          document.documentElement.classList.remove('marker-enter')
          player.setLocked(false)
          res()
        }, PLAYER_JUMP_END_ANIMATION_MS)()

        if (isDrama) {
          SOUNDS.music.dramatic.play()
          debounce(() => SOUNDS.music.dramatic.stop(), 10000)()
        }
      }, PLAYER_JUMP_START_ANIMATION_MS)()
    })
  }
}
