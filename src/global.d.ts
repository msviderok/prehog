import type { FunctionReturnType } from 'convex/server'
import type { Accessor } from 'solid-js'
import type { api } from '../convex/_generated/api'
import type { Doc } from '../convex/_generated/dataModel'
import type { RtcState } from './lib/createRtcState'

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

  interface NodeAction<T> {
    value: T
    get: Accessor<T>
    set: Setter<T>
  }

  type SceneNodeStatus = { type: 'not-started' } | { type: 'in-progress' }

  type SceneNode = SceneNodePopover | SceneNodePlayer

  interface BaseSceneNodeProps {
    rootRef: HTMLElement | undefined
    size: { width: number; height: number }
    hitbox: { x1: number; y1: number; x2: number; y2: number }
    collided: NodeAction<boolean>
    status: NodeAction<SceneNodeStatus>
  }

  interface SceneNodePopover extends BaseSceneNodeProps {
    type: 'popover'
    popupRef: HTMLElement | undefined
    anchorPosition?: { x: number; y: number }
    markerPosition: { x: number; y: number }
  }

  interface SceneNodePlayer extends BaseSceneNodeProps {
    type: 'player'
  }

  interface OtherPlayer {
    ref: HTMLDivElement | undefined
    x: number
    batchQueue: GameEventBatch
    size: BaseSceneNodeProps['size']
    hitbox: BaseSceneNodeProps['hitbox']
  }

  type CurrentScene = Doc<'game_user_state'>['scene']

  type LoadingStatus = 'not-initiated' | 'signed-out' | 'loading-clerk' | 'loading-game-state' | UserData

  interface MyPlayer {
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
    currentScene: CurrentScene
  }

  interface Misc {
    player: {
      size: { width: number; height: number; halfWidth: number; halfHeight: number }
      hitbox: { y1: number; y2: number }
    }
    eventMarker: { r: number; h: number }
  }

  interface GlobalState {
    viewport: { width: number; height: number; vw: number; vh: number }
    scene: Scene
    nodes: Set<SceneNode>
    player: MyPlayer
    rtc: RtcState
    otherPlayers: {
      list: Accessor<Array<Id<'users'>>>
      hashmap: Map<Id<'users'>, OtherPlayer>
    }
    misc: Misc
    debugData: Accessor<DebugData>
    recalculate: () => void
  }
}

export {}
