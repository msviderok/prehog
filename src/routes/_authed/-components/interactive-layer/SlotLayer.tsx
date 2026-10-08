import { createMemo, For } from 'solid-js'
import { Dynamic } from 'solid-js/web'
import { useGlobalState } from '../GlobalStateContext'
import { InteractiveNodeContext } from './context'

export function SlotLayer(props: { type: keyof NodeSlots }) {
  const { nodes, nodeSlots } = useGlobalState()
  const entries = createMemo(() => {
    return Object.entries(nodeSlots).flatMap(([id, slots]) => {
      const component = slots[props.type]
      const node = nodes.get(id)
      return component && node ? [{ id, node, component }] : []
    })
  })

  return (
    <For each={entries()}>
      {(entry) => (
        <InteractiveNodeContext.Provider value={entry}>
          <Dynamic component={entry.component} />
        </InteractiveNodeContext.Provider>
      )}
    </For>
  )
}
