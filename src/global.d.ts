import type { Doc } from '../convex/_generated/dataModel'

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

  interface SceneNode {
    type: 'popover'
    open: boolean
    rootRef: HTMLElement | undefined
    popupRef: HTMLElement | undefined
    position: Coords
    hitbox: Hitbox
    hitboxScaled: Hitbox
  }
}

export {}
