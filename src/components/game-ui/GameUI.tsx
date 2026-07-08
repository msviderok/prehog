import { api } from '@/convex/api'
import type { Id } from '@/convex/dataModel'
import { useStableQuery } from '@/lib/useStableQuery'
import { SnapModifier } from '@dnd-kit/abstract/modifiers'
import { Feedback, PointerSensor } from '@dnd-kit/dom'
import { RestrictToWindow } from '@dnd-kit/dom/modifiers'
import { DragDropProvider } from '@dnd-kit/solid'
import { useMutation } from 'convex-solidjs'
import { For } from 'solid-js'
import { ActionBar } from './ActionBar'
import { FloatingPanel } from './FloatingPanel'

export function GameUI() {
  const floatingPanels = useStableQuery(api.users.floatingPanels, {}, { initialData: [] })
  const updatePosition = useMutation(api.floatingPanels.updatePosition)

  function updatePanelPosition(id: Id<'floating_panels_position'>, rect: Pick<DOMRect, 'left' | 'top'>) {
    void updatePosition.mutate({ id, x: Math.round(rect.left), y: Math.round(rect.top) })
  }

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
      <For each={floatingPanels.data()}>{(panel) => <FloatingPanel id={panel._id} />}</For>
    </DragDropProvider>
  )
}
