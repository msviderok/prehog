import { makePersisted } from '@solid-primitives/storage'
import { createStore, produce } from 'solid-js/store'

export type FloatingPanelsState = ReturnType<typeof createFloatingPanelsState>

export function createFloatingPanelsState() {
  const [floatingPanels, setFloatingPanels] = makePersisted(
    createStore({ panels: {} as Record<string, { x: number; y: number }> }),
    { name: 'floating-panels' },
  )

  function isFloatingPanelOpen(id: string) {
    return floatingPanels.panels[id] != null
  }

  function openFloatingPanel(id: string, position: { x: number; y: number }) {
    setFloatingPanels('panels', id, position)
  }

  function closeFloatingPanel(id: string) {
    setFloatingPanels(
      'panels',
      produce((state) => {
        delete state[id]
      }),
    )
  }

  return {
    floatingPanels,
    setFloatingPanels,
    isFloatingPanelOpen,
    openFloatingPanel,
    closeFloatingPanel,
  }
}
