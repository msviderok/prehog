import type { FloatingPanelsState } from './lib/state/createFloatingPanelsState'
import type { IntervalsState } from './lib/state/createIntervalState'
import type { KeyPressedState } from './lib/state/createKeyPressedState'
import type { MiscState } from './lib/state/createMiscState'
import type { PlayerState } from './lib/state/createPlayerState'
import type { RtcState } from './lib/state/createRtcState'
import type { SceneState, SceneNode as SceneStateNode } from './lib/state/createSceneState'

declare global {
  namespace GlobalState {
    type State = KeyPressedState &
      PlayerState &
      SceneState &
      FloatingPanelsState &
      RtcState &
      IntervalsState &
      MiscState

    type KeyPressed = KeyPressedState['keyPressed']
    type Player = PlayerState['player']
    type Scene = SceneState['sceneState']
    type SceneNode = SceneStateNode
    type FloatingPanels = FloatingPanelsState['floatingPanels']
    type RTC = RtcState['rtc']
    type Intervals = Pick<IntervalsState, 'batchInterval' | 'samplingInterval'>
  }
}

export {}
