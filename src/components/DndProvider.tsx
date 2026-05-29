import { SnapModifier } from '@dnd-kit/abstract/modifiers'
import { RestrictToWindow } from '@dnd-kit/dom/modifiers'
import { DragDropProvider } from '@dnd-kit/solid'
import { type ParentProps } from 'solid-js'
import { produce } from 'solid-js/store'
import { useGlobalState } from './GlobalStateContext'
import { Feedback } from '@dnd-kit/dom'

export function DndProvider(props: ParentProps) {
  const { setFloatingPanels } = useGlobalState()

  return (
    <DragDropProvider
      modifiers={[SnapModifier.configure({ size: 1 }), RestrictToWindow]}
      plugins={(defaults) => [...defaults, Feedback.configure({ feedback: 'move' })]}
      onDragEnd={(e) => {
        if (!e.operation.shape || !e.operation.source) return
        const { source, shape } = e.operation
        setFloatingPanels(
          'panels',
          produce((state) => {
            state[source.id] = {
              x: shape.current.boundingRectangle.left,
              y: shape.current.boundingRectangle.top,
            }
          }),
        )
      }}
    >
      <>{() => props.children}</>
    </DragDropProvider>
  )
}
