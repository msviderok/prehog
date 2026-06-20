import { api } from '@/convex/api'
import type { Doc } from '@/convex/dataModel'
import { useDraggable } from '@dnd-kit/solid'
import { useMutation, useQuery } from 'convex-solidjs'
import { createMemo, splitProps, type Component, type JSX } from 'solid-js'
import { Dynamic, Portal } from 'solid-js/web'
import { ChatPanel } from './ChatPanel'
import { FloatingContext } from './FloatingContext'
import { RtcPanel } from './rtc-panel/RtcPanel'

const FLOATING_COMPONENTS: Record<Doc<'floating_panels'>['type'], Component<any>> = {
  chat: ChatPanel,
  rtc: RtcPanel,
}

export function FloatingPanel(props: Doc<'floating_panels'>) {
  const [, rest] = splitProps(props, ['type'])
  const deletePanel = useMutation(api.floatingPanels.remove)
  const { draggable, ref, handleRef } = useDraggable({
    get id() {
      return props.positionId
    },
  })

  const { data: position } = useQuery(api.floatingPanels.position, { id: props.positionId }, { keepPreviousData: true })

  const style = createMemo<JSX.CSSProperties>(() => {
    const p = position()
    if (!p) return {}
    return {
      transform: `translate(${p.x ?? 0}px, ${p.y ?? 0}px)`,
      'z-index': `${p.zIndex ?? 0}`,
    }
  })

  return (
    <Portal>
      <FloatingContext.Provider
        value={{
          draggable,
          handleRef,
          floatingPanel: props,
          closePanel() {
            deletePanel.mutate({ floatingPanelId: props._id })
          },
        }}
      >
        <div
          id={props.positionId}
          ref={ref}
          data-interactive="true"
          class="shadow-[0_0_5px_3px] shadow-transparent py-0! focus:border-tint-accent/10 focus-within:border-tint-accent/10 rounded-base  data-dnd-dragging:not-data-dnd-dropping:border-tint-accent/10 focus-within:shadow-shade-accent/30 data-dnd-dragging:not-data-dnd-dropping:shadow-shade-accent/30 focus:shadow-shade-accent/30 fixed top-0 left-0 z-1000 transition-[border,box-shadow] ease-out duration-100 data-dnd-dropping:duration-0"
          style={style()}
        >
          <Dynamic component={FLOATING_COMPONENTS[props.type]} {...(rest as any)} />
        </div>
      </FloatingContext.Provider>
    </Portal>
  )
}
