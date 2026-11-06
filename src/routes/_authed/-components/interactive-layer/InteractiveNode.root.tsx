import { createEffect, createSignal, on, type ParentProps } from 'solid-js'
import { useGlobalState } from '../GlobalStateContext'
import { createInteractiveNode } from './createInteractiveNode'
import { InteractiveNodeContext } from './context'

export function Root(props: ParentProps<{ id: string }>) {
  const { popover } = useGlobalState()
  const [anchorRef, setAnchorRef] = createSignal<HTMLButtonElement>()
  const node = createInteractiveNode(props.id, 'popover', {
    popover: { positioner: {}, anchorRef, setAnchorRef },
    dialog: {},
    marker: { x: 0, y: 0, reactive: {} as any },
  })

  createEffect(
    on(node.collided, (c) => {
      popover.setActiveNode(c ? props.id : undefined)
    }),
  )

  return (
    <InteractiveNodeContext.Provider value={{ id: props.id, node }}>{props.children}</InteractiveNodeContext.Provider>
  )
}
