import { createContext, useContext, type Accessor, type Setter } from 'solid-js'

export interface AudioManagerState {
  volume: Accessor<number>
  setVolume: Setter<number>
  bgMusic: Accessor<boolean>
  setBgMusic: Setter<boolean>
}

export const AudioManagerContext = createContext<AudioManagerState>()

export function useAudioManager() {
  const ctx = useContext(AudioManagerContext)
  if (!ctx) throw new Error('useAudioManager must be used within an AudioManagerProvider')
  return ctx
}
