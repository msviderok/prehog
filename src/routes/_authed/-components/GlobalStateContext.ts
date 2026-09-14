import { createContext, useContext } from 'solid-js'
import type { GlobalState } from './GlobalStateProvider'

export const GlobalStateContext = createContext<GlobalState>()

export function useGlobalState() {
  const context = useContext(GlobalStateContext)
  if (!context) throw new Error('useGlobalState must be used inside GlobalState.Provider')
  return context
}
