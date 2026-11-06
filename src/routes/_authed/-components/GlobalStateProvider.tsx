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
import { useMutation } from 'convex-solidjs'
import type { FunctionReturnType } from 'convex/server'
import { batch, createEffect, createMemo, createSignal, ErrorBoundary, on, Show, type ParentProps } from 'solid-js'
import { createRtcState } from '../../../lib/createRtcState'
import { GameState } from './GameState'
import { GlobalStateContext, useGlobalState } from './GlobalStateContext'
import { Loading } from './Loading'
import { useGameLoop } from './useGameLoop'
import { useWatchPresence } from './useWatchPresence'

export function GameEngine(props: ParentProps) {
  const { data: currentScene } = useStableQuery(api.gameState.currentScene)
  const { data: myPlayerInitialState } = useStableQuery(api.gameState.getMyInitialState)
  const { data: lastKnownXPositions } = useStableQuery(api.gameState.getLastKnownXPositions)
  const isMyPlayerStateLoaded = createMemo(() => myPlayerInitialState() !== undefined)
  const isCurrentSceneFetched = createMemo(() => currentScene() !== undefined)
  const isLastPositionsLoaded = createMemo(() => lastKnownXPositions() !== undefined)
  const isEverythingLoaded = createMemo(
    () => isMyPlayerStateLoaded() && isCurrentSceneFetched() && isLastPositionsLoaded(),
  )

  return (
    <ErrorBoundary
      fallback={(err, _reset) => {
        console.log('🔴')
        console.error(err)
      }}
    >
      <Show when={isEverythingLoaded()} fallback={<Loading type="convex" />}>
        <GlobalStateProvider
          currentScene={currentScene()!}
          myPlayerInitialState={myPlayerInitialState()!}
          lastKnownXPositions={lastKnownXPositions()!}
        >
          {props.children}
        </GlobalStateProvider>
      </Show>
    </ErrorBoundary>
  )
}

function GlobalStateProvider(
  props: ParentProps<{
    currentScene: FunctionReturnType<typeof api.gameState.currentScene>
    myPlayerInitialState: FunctionReturnType<typeof api.gameState.getMyInitialState>
    lastKnownXPositions: FunctionReturnType<typeof api.gameState.getLastKnownXPositions>
  }>,
) {
  const rtc = createRtcState()
  const player = createPlayer()
  const popover = createPopover()
  const dialog = createDialog()
  const scene = createScene()
  const interaction = createInteraction({ player, dialog })
  const { data: otherPlayersIds } = useStableQuery(api.users.listOnlineUsers, {}, { initialData: [] })
  const gameState = new GameState({
    player,
    currentScene: () => props.currentScene,
    lastKnownXPositions: () => props.lastKnownXPositions,
  })

  if (import.meta.hot) {
    import.meta.hot.on('vite:afterUpdate', () => {
      gameState.updateScene()
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

  useBlocker({
    enableBeforeUnload: false,
    shouldBlockFn: ({ action }) => {
      if (action === 'BACK' || action === 'FORWARD') return true
      return false
    },
  })

  return <>{props.children}</>
}

function createPlayer() {
  const clerk = useClerk()
  const isAdmin = createMemo(() => !!clerk()?.user?.publicMetadata?.isAdmin)
  const [hat, setHat] = createSignal<number>()
  const [skin, setSkin] = createSignal(0)
  const [isWalking, setIsWalking] = createSignal(false)
  const [isRunning, setIsRunning] = createSignal(false)
  const [direction, setDirection] = createSignal<MovementDirection>(0)
  const [facingDirection, setFacingDirection] = createSignal<FacingDirection>('right')
  const [renderedSlotRef, setRenderedSlotRef] = createSignal<HTMLElement>()
  const [action, setAction] = createSignal<MyPlayerAction>('idle')
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
      enterMarker(isDrama) {
        if (isDrama === false) return

        const dramaticMusic = isDrama ? SOUNDS.music.dramatic : null
        player.setAction('jump-start')
        debounce(() => {
          player.setAction('jump-midair')
          if (isDrama) dramaticMusic?.play()
          debounce(() => {
            dramaticMusic?.stop()
            // player.setAction('teleport-from-top')
          }, 10000)()
          debounce(() => {
            player.setAction('jump-end')
          }, PLAYER_JUMP_END_ANIMATION_MS)()
        }, PLAYER_JUMP_START_ANIMATION_MS)()
      },
    },
  }

  createEffect(
    on(player.direction, (dir) => {
      player.__gameloop.direction = dir
      if (dir === -1) setFacingDirection('left')
      else if (dir === 1) setFacingDirection('right')
    }),
  )

  const { data: shouldSendBatches } = useStableQuery(
    api.gameState.shouldSendRealTimeMovement,
    {},
    { initialData: false },
  )

  createEffect(on(shouldSendBatches, (shouldSend) => (player.__gameloop.shouldSendBatches = shouldSend)))

  return player
}

function createInteraction(props: Pick<GlobalState, 'player' | 'dialog'>) {
  const [hostRef, setHostRef] = createSignal<HTMLElement>()
  const [data, setData] = createSignal<InteractionData>({ type: 'idle' })
  const isInteractionActive = createMemo(() => data().type !== 'idle')
  const isMovementBlocked = createMemo(() => isInteractionActive())

  createEffect(on(isMovementBlocked, (blocked) => (props.player.__gameloop.isHijacked = blocked)))

  const interaction: GlobalState['interaction'] = {
    hostRef,
    setHostRef,
    isActive: isInteractionActive,
    isMovementBlocked,
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

      batch(() => {
        setData(initialData)
      })
    },
    finish() {
      batch(() => {
        setData({ type: 'idle' })
        props.dialog.close()
      })
    },
  }

  createEffect(
    on(interaction.data, (currentInteraction) => {
      const root = document.documentElement
      switch (currentInteraction.type) {
        case 'marker-enter': {
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
  return {
    ref: null as unknown as HTMLElement,
    backgroundRef: null as unknown as HTMLElement,
    popupContainerRef: null as unknown as HTMLElement,
    elementsContainerRef: null as unknown as HTMLElement,
    viewportRef,
    setViewportRef,
    tx: 0,
  }
}

function useKeyboardManager(): void {
  const { player, interaction } = useGlobalState()
  const updateIsWalking = useMutation(api.gameState.setIsWalking)
  const updateIsRunning = useMutation(api.gameState.setIsRunning)
  const updateDirection = useMutation(api.gameState.setDirection)

  const heldKeys = createHeldKeys()
  createEffect(
    on(
      () => heldKeys(),
      (held) => {
        if (interaction.isMovementBlocked()) return

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
          player.__gameloop.speed = running ? 2 : 1
          player.setAction(walking ? 'walk' : 'idle')
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
        return interaction.isMovementBlocked() === false
      },
    },
  )
}
