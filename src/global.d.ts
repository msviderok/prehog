import type { Popover as PopoverPrimitive } from '@msviderok/base-ui-solid/popover'
import type { FunctionReturnType } from 'convex/server'
import type { Accessor, JSX, Setter } from 'solid-js'
import type { api } from '../convex/_generated/api'
import type { Doc, Id } from '../convex/_generated/dataModel'
import type { RtcState } from './lib/createRtcState'
import type { NodeRegistry } from './routes/_authed/-components/NodeRegistry'
import type { SoundsUI } from './audio/index'
import type { GameState } from './routes/_authed/-components/GameState'

declare global {
  type PanelTypeChat = Extract<Doc<'floating_panels'>, { type: 'chat' }>
  type PanelTypeRTC = Extract<Doc<'floating_panels'>, { type: 'rtc' }>

  type MessageDM = Extract<Doc<'chat_messages'>, { type: 'dm' }>
  type MessageSystem = Extract<Doc<'chat_messages'>, { type: 'system' }>
  type MessageSystemCall = Extract<Doc<'chat_messages'>['body'], { type: 'call' }>
  type MessageBodySystemCallEnded = Extract<Doc<'chat_messages'>['body'], { type: 'call'; status: 'ended' }>
  type MessageBodySystemCallDeclined = Extract<Doc<'chat_messages'>['body'], { type: 'call'; status: 'declined' }>

  type CallRtcMessageOffer = Extract<Doc<'call_rtc_messages'>, { type: 'offer' | 'answer' }>
  type CallRtcMessageAnswer = Extract<Doc<'call_rtc_messages'>, { type: 'offer' | 'answer' }>
  type CallRtcMessageIceCandidate = Extract<Doc<'call_rtc_messages'>, { type: 'ice-candidate' }>

  type UserData = FunctionReturnType<typeof api.users.current>

  type GameEventBatch = Doc<'game_event_batches'>['batch']
  type GameEvent = GameEventBatch[0]

  type KebabToPascal<S extends string> = S extends `${infer Head}-${infer Tail}`
    ? `${Capitalize<Head>}${KebabToPascal<Tail>}`
    : Capitalize<S>

  type Kind = 'audio' | 'video'

  type MaybeAccessor<T> = T | Accessor<T>

  interface Size {
    width: number
    height: number
  }

  interface Hitbox {
    x1: number
    y1: number
    x2: number
    y2: number
  }

  interface Coords {
    x: number
    y: number
  }

  type InteractiveNodeStatus = 'idle' | 'interacting'

  interface CollisionNode {
    size: { width: number; height: number }
    hitbox: { x1: number; y1: number; x2: number; y2: number }
  }

  type OtherPlayerAction = CommonPlayerAction | 'jump'
  type InteractiveNode = CollisionNode & {
    collided: Accessor<boolean>
    setCollided: Setter<boolean>
    status: Accessor<InteractiveNodeStatus>
    setStatus: Setter<InteractiveNodeStatus>
  } & (
      | {
          type: 'player'
          data: CommonPlayerProps<OtherPlayerAction> & {
            batchQueue: GameEventBatch
          }
        }
      | {
          type: 'popover'
          data: {
            popover: {
              anchorRef: Accessor<HTMLButtonElement | undefined>
              setAnchorRef: Setter<HTMLButtonElement | undefined>
              positioner: Pick<PopoverPrimitive.Positioner.Props, 'side' | 'align'>
            }
            dialog: {}
            marker: {
              x: number
              y: number
              reactive: {
                hitbox: Accessor<Hitbox>
                setHitbox: Setter<Hitbox>
                size: Accessor<Size>
                setSize: Setter<Size>
              }
            }
          }
        }
    )

  type InteractiveNodeOf<K extends InteractiveNode['type']> = Extract<InteractiveNode, { type: K }>

  interface NodeSlots {
    asset?: () => JSX.Element
    marker?: () => JSX.Element
    popoverAnchor?: () => JSX.Element
    popoverContent?: () => JSX.Element
    dialogContent?: () => JSX.Element
    interaction?: Record<string, () => JSX.Element>
  }

  type CurrentScene = Doc<'game_user_state'>['scene']
  type LoadingStatus = 'not-initiated' | 'signed-out' | 'loading-clerk' | 'loading-game-state' | UserData

  type Left = -1
  type Right = 1
  type Standing = 0
  type MovementDirection = Left | Standing | Right
  type FacingDirection = 'left' | 'right'
  type JumpStage = false | 'jump-start' | 'jump-midair' | 'jump-end'
  type CommonPlayerAction = 'idle' | 'walk'

  interface CommonPlayerProps<Actions extends string> {
    ref: HTMLDivElement | undefined
    x: number
    facingDirection: Accessor<FacingDirection>
    isWalking: Accessor<boolean>
    isRunning: Accessor<boolean>
    isJumping: Accessor<boolean>
    hat: Accessor<number | undefined>
    skin: Accessor<number>
    isAdmin: Accessor<boolean>
    action: Accessor<Actions>
  }

  type MyPlayerAction = CommonPlayerAction | 'jump-start' | 'jump-midair' | 'jump-end'
  type MyPlayerJumpAction = Extract<MyPlayerAction, `jump-${string}`>
  type MyPlayerTeleportAction = Extract<MyPlayerAction, `teleport-${string}`>
  interface MyPlayer extends CommonPlayerProps<MyPlayerAction> {
    __gameloop: {
      direction: 1 | 0 | -1 // 1 – right, 0 – stopped, -1 – left
      hitbox: { x1: number; y1: number; x2: number; y2: number }
      tx: number
      speed: number
      shouldSendBatches: boolean
      isHijacked: boolean
      lastPosition: Record<string, any> | null
      paused: boolean
    }
    direction: Accessor<MovementDirection>
    setIsWalking: Setter<boolean>
    setIsRunning: Setter<boolean>
    setHat: Setter<number | undefined>
    setSkin: Setter<number>
    setDirection: Setter<MovementDirection>
    setAction: Setter<MyPlayerAction>
    setInitialData: (data: FunctionReturnType<typeof api.gameState.getMyInitialState>) => void
    renderedSlotRef: Accessor<HTMLElement | undefined>
    setRenderedSlotRef: Setter<HTMLElement | undefined>
    playAnimation: {
      jump: () => void
      enterMarker: (isDrama?: boolean) => void
    }
  }

  interface Scene {
    /** Ref to the scene container element */
    ref: HTMLElement | undefined
    /** Ref to the scene background element */
    backgroundRef: HTMLElement | undefined
    /** Ref to the scene popup container element */
    popupContainerRef: HTMLElement | undefined
    /** Ref to the scene elements container element */
    elementsContainerRef: HTMLElement | undefined
    /** Ref of the viewport which is equal to the size of the screen */
    viewportRef: Accessor<HTMLDivElement | undefined>
    setViewportRef: Setter<HTMLDivElement | undefined>
    /** The current position of the viewport a.k.a. "camera" showing the portion of the scene in world units */
    tx: number
  }

  interface SceneryPopover {
    isOpen: Accessor<boolean>
    activeNodeId: Accessor<string | undefined>
    prevActiveNodeId: Accessor<string | undefined>
    setActiveNode: (id: string | undefined) => void
  }

  interface SceneryDialog {
    isOpen: Accessor<boolean>
    activeNodeId: Accessor<string | undefined>
    open: (id: string) => void
    close: () => void
  }

  type InteractionData =
    | {
        type: 'idle'
      }
    | {
        type: 'marker-enter'
        nodeId: string
        isDrama: boolean
      }
    | {
        type: 'marker-teleport'
        nodeId: string
      }
  interface Interaction {
    hostRef: Accessor<HTMLElement | undefined>
    setHostRef: Setter<HTMLElement | undefined>
    isActive: Accessor<boolean>
    isMovementBlocked: Accessor<boolean>
    data: Accessor<InteractionData>
    setData: Setter<InteractionData>
    start: (initialData: Exclude<InteractionData, { type: 'idle' }>) => void
    finish: (type: 'confirm' | 'cancel') => void
  }

  interface GlobalState {
    gameState: GameState
    scene: Scene
    popover: SceneryPopover
    dialog: SceneryDialog
    interaction: Interaction
    player: MyPlayer
    rtc: RtcState
    otherPlayersIds: Accessor<Id<'users'>[]>
  }

  interface Sound {
    ui: SoundsUI
  }
}

export {}
