import { api } from '@/convex/api'
import type { Id } from '@/convex/dataModel'
import { useDraggable } from '@dnd-kit/solid'
import { useMutation, useQuery } from 'convex-solidjs'
import { createMemo, Match, Show, Switch, type JSX } from 'solid-js'
import { Portal } from 'solid-js/web'
import { ChatPanel } from './ChatPanel'
import { FloatingContext } from './FloatingContext'
import { RtcPanel } from './rtc-panel/RtcPanel'

export function FloatingPanel(props: { id: Id<'floating_panels'> }) {
  const deletePanel = useMutation(api.floatingPanels.remove)

  const { data: panel } = useQuery(api.floatingPanels.findById, () => ({ id: props.id }))
  const { data: position } = useQuery(
    api.floatingPanels.position,
    () => ({ id: panel()?.positionId as any }),
    () => ({ enabled: panel()?.positionId != null, keepPreviousData: true }),
  )

  const { draggable, ref, handleRef } = useDraggable({
    get id() {
      return panel()?.positionId ?? ''
    },
  })

  const style = createMemo<JSX.CSSProperties>(() => {
    const p = position()
    if (!p) return {}
    return {
      transform: `translate(${p.x ?? 0}px, ${p.y ?? 0}px)`,
      'z-index': `${p.zIndex ?? 0}`,
    }
  })

  return (
    <Show when={panel()}>
      {(p) => (
        <Portal>
          <FloatingContext.Provider
            value={{
              draggable,
              handleRef,
              closePanel() {
                deletePanel.mutate({ floatingPanelId: p()._id })
              },
            }}
          >
            <div
              id={p().positionId}
              ref={ref}
              data-interactive="true"
              class="shadow-[0_0_5px_3px] shadow-transparent py-0! focus:border-tint-accent/10 focus-within:border-tint-accent/10 rounded-base  data-dnd-dragging:not-data-dnd-dropping:border-tint-accent/10 focus-within:shadow-shade-accent/30 data-dnd-dragging:not-data-dnd-dropping:shadow-shade-accent/30 focus:shadow-shade-accent/30 fixed top-0 left-0 z-1000 transition-[border,box-shadow] ease-out duration-100 data-dnd-dropping:duration-0"
              style={style()}
            >
              <Switch>
                <Match when={p().type === 'chat'}>
                  <ChatPanel chatId={(p() as PanelTypeChat).chatId} />
                </Match>
                <Match when={p().type === 'rtc'}>
                  <RtcPanel />
                </Match>
              </Switch>
            </div>
          </FloatingContext.Provider>
        </Portal>
      )}
    </Show>
  )
}
