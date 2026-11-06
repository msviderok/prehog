import { createContext, useContext } from 'solid-js'

export const SceneContext = createContext<CurrentScene>()

export function useSceneContext() {
  const ctx = useContext(SceneContext)
  if (!ctx) throw new Error(`useSceneContext must be used within SceneContext.Provider`)
  return ctx
}
