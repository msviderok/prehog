import type { Accessor } from 'solid-js'
import type { Doc } from '../convex/_generated/dataModel'
import type { api } from '../convex/_generated/api'
import type { FunctionReturnType } from 'convex/server'

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

  type SceneNode = SceneNodePopover | SceneNodePlayer

  interface BaseSceneNodeProps {
    rootRef: HTMLElement | undefined
    size: { width: number; height: number }
    readonly hitbox: { x1: number; y1: number; x2: number; y2: number }
    actions: {
      open: NodeAction<boolean>
    }
  }

  interface SceneNodePopover extends BaseSceneNodeProps {
    type: 'popover'
    popupRef: HTMLElement | undefined
    anchorPosition: { x: number; y: number }
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

  interface CSSStyleDeclaration {
    '--original-scene-width'?: string
    '--original-scene-height'?: string
    '--player-offset-y'?: string
    '--original-player-width'?: string
    '--original-player-height'?: string
    '--original-player-hitbox-width'?: string
    '--original-player-hitbox-height'?: string
    '--scale'?: string
    '--scene-offset-top'?: string
    '--wux'?: string
    '--wuy'?: string
  }
}

export {}
