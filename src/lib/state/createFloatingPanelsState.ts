import { useMutation, useQuery } from 'convex-solidjs'
import { createMemo } from 'solid-js'
import { api } from '../../../convex/_generated/api'
import type { Doc, Id } from '../../../convex/_generated/dataModel'

const FLOATING_PANEL_OFFSET = 10

export type FloatingPanelsState = ReturnType<typeof createFloatingPanelsState>

export function createFloatingPanelsState() {
  const floatingPanels = useQuery(api.users.floatingPanels, {}, { initialData: [], keepPreviousData: true })
  const createNewPanel = useMutation(api.floatingPanels.create)
  const deletePanel = useMutation(api.floatingPanels.remove)
  const updatePosition = useMutation(api.floatingPanels.updatePosition)

  const floatingPanelLookup = createMemo(() => {
    return (floatingPanels.data() ?? []).reduce(
      (acc, panel) => {
        acc.byId.set(panel._id, panel)
        acc.byChatId.set(panel.chatId, panel)
        return acc
      },
      {
        byId: new Map<Id<'floating_panels'>, Doc<'floating_panels'>>(),
        byChatId: new Map<Id<'chats'>, Doc<'floating_panels'>>(),
      },
    )
  })

  function getFloatingPanel(id: Id<'floating_panels'>) {
    return floatingPanelLookup().byId.get(id)!
  }

  function isFloatingPanelOpen(panelId: Id<'floating_panels'>): boolean
  function isFloatingPanelOpen(data: { chatId: Id<'chats'>; type: Doc<'floating_panels'>['type'] }): boolean
  function isFloatingPanelOpen(
    args: Id<'floating_panels'> | { chatId: Id<'chats'>; type: Doc<'floating_panels'>['type'] },
  ): boolean {
    if (typeof args === 'string') return floatingPanelLookup().byId.has(args)
    const panel = floatingPanelLookup().byChatId.get(args.chatId)
    return !!panel && panel.type === args.type
  }

  function openFloatingPanel(props: { target: Element } & Pick<Doc<'floating_panels'>, 'type' | 'chatId'>) {
    const rect = props.target.getBoundingClientRect()
    const x = rect.right + FLOATING_PANEL_OFFSET
    const y = rect.top
    void createNewPanel.mutate({ x, y, type: props.type, chatId: props.chatId })
  }

  function closeFloatingPanel(id: Id<'floating_panels'>) {
    void deletePanel.mutate({ floatingPanelId: id })
  }

  function updatePanelPosition(id: Id<'floating_panels_position'>, rect: Pick<DOMRect, 'left' | 'top'>) {
    void updatePosition.mutate({ id, x: rect.left, y: rect.top })
  }

  return {
    floatingPanels,
    getFloatingPanel,
    openFloatingPanel,
    closeFloatingPanel,
    isFloatingPanelOpen,
    updatePanelPosition,
  }
}
