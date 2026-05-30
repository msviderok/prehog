import { makePersisted } from '@solid-primitives/storage'
import { createStore, produce } from 'solid-js/store'

const FLOATING_PANEL_OFFSET = 10

export type FloatingPanelsState = ReturnType<typeof createFloatingPanelsState>

export function createFloatingPanelsState() {
  const [floatingPanels, setFloatingPanels] = makePersisted(
    createStore({ panels: {} as Record<string, { x: number; y: number }> }),
    { name: 'floating-panels' },
  )

  function getFloatingPanel(id: string) {
    return floatingPanels.panels[id]
  }

  function isFloatingPanelOpen(id: string) {
    return floatingPanels.panels[id] != null
  }

  function openFloatingPanel(id: string, target: Element) {
    const rect = target.getBoundingClientRect()
    setFloatingPanels('panels', id, { x: rect.right + FLOATING_PANEL_OFFSET, y: rect.top })
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
    getFloatingPanel,
    isFloatingPanelOpen,
    openFloatingPanel,
    closeFloatingPanel,
  }
}
