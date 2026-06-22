import type { Doc } from '../convex/_generated/dataModel'
import type { IntervalsState } from './lib/state/createIntervalState'
import type { KeyPressedState } from './lib/state/createKeyPressedState'
import type { MiscState } from './lib/state/createMiscState'
import type { PlayerState } from './lib/state/createPlayerState'
import type { SceneState, SceneNode as SceneStateNode } from './lib/state/createSceneState'

declare global {
  namespace GlobalState {
    type State = KeyPressedState & PlayerState & SceneState & IntervalsState & MiscState

    type KeyPressed = KeyPressedState['keyPressed']
    type Player = PlayerState['player']
    type Scene = SceneState['sceneState']
    type SceneNode = SceneStateNode
    type Intervals = Pick<IntervalsState, 'batchInterval' | 'samplingInterval'>
  }

  type PanelTypeChat = Extract<Doc<'floating_panels'>, { type: 'chat' }>
  type PanelTypeRTC = Extract<Doc<'floating_panels'>, { type: 'rtc' }>

  type MessageDM = Extract<Doc<'chat_messages'>, { type: 'dm' }>
  type MessageSystem = Extract<Doc<'chat_messages'>, { type: 'system' }>
  type MessageSystemCall = Extract<Doc<'chat_messages'>, { body: { type: 'call' } }>
  type MessageBodySystemCallEnded = Extract<Doc<'chat_messages'>['body'], { type: 'call'; status: 'ended' }>
  type MessageBodySystemCallDeclined = Extract<Doc<'chat_messages'>['body'], { type: 'call'; status: 'declined' }>

  type CallRtcMessageOffer = Extract<Doc<'call_rtc_messages'>, { type: 'offer' | 'answer' }>
  type CallRtcMessageAnswer = Extract<Doc<'call_rtc_messages'>, { type: 'offer' | 'answer' }>
  type CallRtcMessageIceCandidate = Extract<Doc<'call_rtc_messages'>, { type: 'ice-candidate' }>

  type KebabToPascal<S extends string> = S extends `${infer Head}-${infer Tail}`
    ? `${Capitalize<Head>}${KebabToPascal<Tail>}`
    : Capitalize<S>

  type Kind = 'audio' | 'video'
}

export {}
