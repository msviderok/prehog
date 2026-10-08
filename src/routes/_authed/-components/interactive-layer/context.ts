import { createContext, useContext } from 'solid-js'

export const InteractiveNodeContext = createContext<{ id: string; node: InteractiveNode }>()

/** @throws */
export function useInteractiveNode<
  T extends InteractiveNode['type'] | undefined,
  R = {
    id: string
    node: T extends string ? InteractiveNodeOf<T> : InteractiveNode
  },
>(): R {
  const ctx = useContext(InteractiveNodeContext)
  if (!ctx) throw new Error('useInteractiveNode must be used within a InteractiveNodeContext')
  return ctx as R
}

export function useInteractiveNodeContext() {
  return useContext(InteractiveNodeContext)
}
