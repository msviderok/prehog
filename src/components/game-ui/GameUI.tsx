import { SnapModifier } from '@dnd-kit/abstract/modifiers'
import { Feedback, PointerSensor } from '@dnd-kit/dom'
import { RestrictToWindow } from '@dnd-kit/dom/modifiers'
import { DragDropProvider } from '@dnd-kit/solid'
import { For } from 'solid-js'
import type { Id } from '../../../convex/_generated/dataModel'
import { useGlobalState } from '../GlobalStateContext'
import { ActionBar } from './ActionBar'
import { FloatingPanel } from './FloatingPanel'

export function GameUI() {
  const { floatingPanels, updatePanelPosition } = useGlobalState()
  return (
    <DragDropProvider
      modifiers={[SnapModifier.configure({ size: 1 }), RestrictToWindow]}
      plugins={(defaults) => [...defaults, Feedback.configure({ feedback: 'move' })]}
      sensors={[
        PointerSensor.configure({
          preventActivation(e) {
            return e.target instanceof Element && e.target.closest('[data-no-drag]') !== null
          },
        }),
      ]}
      onDragEnd={(e) => {
        if (!e.operation.shape || !e.operation.source) return
        const { source, shape } = e.operation

        updatePanelPosition(source.id as Id<'floating_panels_position'>, shape.current.boundingRectangle)
      }}
    >
      <ActionBar />
      <For each={floatingPanels.data()}>{(panel) => <FloatingPanel {...panel} />}</For>
    </DragDropProvider>
  )
}
