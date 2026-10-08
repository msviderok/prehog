import { createEffect, on, type ParentProps } from 'solid-js'
import { useGlobalState } from '../GlobalStateContext'
import { createInteractiveNode } from './createInteractiveNode'
import { InteractiveNodeContext } from './context'

export function Root(props: ParentProps<{ id: string }>) {
  const { popover } = useGlobalState()
  const node = createInteractiveNode(props.id, 'popover', { positioner: {}, anchorRef: undefined })

  createEffect(on(node.collided, (c) => popover.setActiveNode(c ? props.id : undefined)))

  return (
    <InteractiveNodeContext.Provider value={{ id: props.id, node }}>{props.children}</InteractiveNodeContext.Provider>
  )
}
