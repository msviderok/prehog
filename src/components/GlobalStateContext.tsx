import { useOnlineStatus } from '@/lib/hooks/useOnlineStatus'
import { createIntervalsState } from '@/lib/state/createIntervalState'
import { createKeyPressedState } from '@/lib/state/createKeyPressedState'
import { createMiscState } from '@/lib/state/createMiscState'
import { createPlayerState } from '@/lib/state/createPlayerState'
import { createSceneState } from '@/lib/state/createSceneState'
import { createContext, createEffect, useContext, type ParentProps } from 'solid-js'

const GlobalStateContext = createContext<GlobalState.State>()

export function useGlobalState() {
  const context = useContext(GlobalStateContext)
  if (!context) throw new Error('useGlobalState must be used inside GlobalState.Provider')
  return context
}

export function GlobalStateProvider(props: ParentProps) {
  const keyPressedState = createKeyPressedState()
  const intervalsState = createIntervalsState()
  const sceneState = createSceneState()
  const playerState = createPlayerState()
  const miscState = createMiscState()

  return (
    <GlobalStateContext.Provider
      value={{
        ...keyPressedState,
        ...intervalsState,
        ...sceneState,
        ...playerState,
        ...miscState,
      }}
    >
      <GlobalStateEffects>{props.children}</GlobalStateEffects>
    </GlobalStateContext.Provider>
  )
}

function GlobalStateEffects(props: ParentProps) {
  const { player, keyPressed, debug } = useGlobalState()

  useOnlineStatus()

  createEffect(() => {
    player.ref?.style.setProperty('--running-mod', `${keyPressed.shift ? 2.5 : 1}`)
  })

  createEffect(() => {
    document.body.classList.toggle('debug', debug())
  })

  return <>{props.children}</>
}
