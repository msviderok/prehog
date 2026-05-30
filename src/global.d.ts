import type { PopoverContentPositionerProps } from './components/ui/popover'
import type { PlayerState } from './lib/state/createPlayerState'
import type { FloatingPanelsState } from './lib/state/createFloatingPanelsState'
import type { RtcState } from './lib/state/createRtcState'
import type { SceneState, SceneNode as SceneStateNode } from './lib/state/createSceneState'
import type { IntervalsState } from './lib/state/createIntervalState'
import type { KeyPressedState } from './lib/state/createKeyPressedState'

declare global {
  namespace GlobalState {
    type State = KeyPressedState & PlayerState & SceneState & FloatingPanelsState & RtcState & IntervalsState

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
