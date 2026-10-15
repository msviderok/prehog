import type { Popover as PopoverPrimitive } from '@msviderok/base-ui-solid/popover'
import type { FunctionReturnType } from 'convex/server'
import type { Accessor, JSX, Setter } from 'solid-js'
import type { api } from '../convex/_generated/api'
import type { Doc, Id } from '../convex/_generated/dataModel'
import type { RtcState } from './lib/createRtcState'
import type { NodeRegistry } from './routes/_authed/-components/NodeRegistry'
import type { SoundsUI } from './audio/index'

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

  type InteractiveNode = CollisionNode & {
    collided: Accessor<boolean>
    setCollided: Setter<boolean>
    status: Accessor<InteractiveNodeStatus>
    setStatus: Setter<InteractiveNodeStatus>
  } & (
      | {
          type: 'popover'
          data: {
            anchorRef: HTMLButtonElement | undefined
            positioner: Pick<PopoverPrimitive.Positioner.Props, 'side' | 'align'>
          }
        }
      | {
          type: 'player'
          data: CommonPlayerProps & { batchQueue: GameEventBatch }
        }
    )

  type InteractiveNodeOf<K extends InteractiveNode['type']> = Extract<InteractiveNode, { type: K }>

  interface NodeSlots {
    asset?: () => JSX.Element
    marker?: () => JSX.Element
    popoverAnchor?: () => JSX.Element
    popoverContent?: () => JSX.Element
    interaction?: Record<string, () => JSX.Element>
  }

  type CurrentScene = Doc<'game_user_state'>['scene']
  type LoadingStatus = 'not-initiated' | 'signed-out' | 'loading-clerk' | 'loading-game-state' | UserData

  type Left = -1
  type Right = 1
  type Standing = 0
  type MovementDirection = Left | Standing | Right
  type FacingDirection = 'left' | 'right'
  interface CommonPlayerProps {
    ref: HTMLDivElement | undefined
    x: number
    facingDirection: Accessor<FacingDirection>
    isWalking: Accessor<boolean>
    isRunning: Accessor<boolean>
    hat: Accessor<number | undefined>
    skin: Accessor<number>
    isAdmin: Accessor<boolean>
  }

  interface MyPlayer extends CommonPlayerProps {
    __gameloop: {
      direction: 1 | 0 | -1 // 1 – right, 0 – stopped, -1 – left
      hitbox: { x1: number; y1: number; x2: number; y2: number }
      tx: number
      speed: number
      shouldSendBatches: boolean
      isHijacked: boolean
    }
    direction: Accessor<MovementDirection>
    setIsWalking: Setter<boolean>
    setIsRunning: Setter<boolean>
    setHat: Setter<number | undefined>
    setSkin: Setter<number>
    setDirection: Setter<MovementDirection>
    setInitialData: (data: FunctionReturnType<typeof api.gameState.getMyInitialState>) => void
    isInitialDataLoaded: Accessor<boolean>
    renderedSlotRef: Accessor<HTMLElement | undefined>
    setRenderedSlotRef: Setter<HTMLElement | undefined>
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
    currentScene: Accessor<CurrentScene>
  }

  interface Misc {
    player: {
      size: { width: number; height: number; halfWidth: number; halfHeight: number }
      hitbox: { y1: number; y2: number }
    }
    eventMarker: { r: number; h: number }
  }

  interface SceneryPopover {
    activeNodeId: Accessor<string | undefined>
    prevActiveNodeId: Accessor<string | undefined>
    setActiveNode: (id: string | undefined) => void
  }

  interface Interaction<T extends unknown = unknown> {
    hostRef: Accessor<HTMLElement | undefined>
    setHostRef: Setter<HTMLElement | undefined>
    isActive: Accessor<boolean>
    setIsActive: Setter<boolean>
    initialData?: T
    start: (initialData: T) => void
    finish: (type: 'confirm' | 'cancel') => void
  }

  interface GlobalState {
    viewport: { width: number; height: number; vw: number; vh: number }
    scene: Scene
    nodes: NodeRegistry
    popover: SceneryPopover
    interaction: Interaction
    player: MyPlayer
    rtc: RtcState
    misc: Misc
    otherPlayersIds: Accessor<Id<'users'>[]>
    debugData: Accessor<DebugData>
    recalculate: () => void
  }

  interface Sound {
    ui: SoundsUI
  }
}

export {}
