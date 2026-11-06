import { createMemo, For } from 'solid-js'
import { Dynamic } from 'solid-js/web'
import { useGlobalState } from '../GlobalStateContext'
import { useSceneContext } from '../Scene.context'
import { InteractiveNodeContext } from './context'

export function SlotLayer(props: { type: keyof NodeSlots }) {
  const { gameState } = useGlobalState()
  const sceneName = useSceneContext()
  const entries = createMemo(() => {
    return Object.entries(gameState.scene(sceneName).nodes.slots).flatMap(([id, slots]) => {
      const component = slots[props.type]
      const node = gameState.scene(sceneName).nodes.get(id)
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
