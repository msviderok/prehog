import type { Draggable } from '@dnd-kit/dom'
import { useDraggable } from '@dnd-kit/solid'
import { useQuery } from 'convex-solidjs'
import { createContext, useContext, type Setter } from 'solid-js'
import { Dynamic, Portal } from 'solid-js/web'
import { api } from '../../../convex/_generated/api'
import type { Doc } from '../../../convex/_generated/dataModel'
import { ChatPanel } from './ChatPanel'
import { useGlobalState } from '../GlobalStateContext'
import { RtcPanel } from './RtcPanel'

interface FloatingContextValue {
  floatingPanel: Doc<'floating_panels'>
  draggable: Draggable
  handleRef: Setter<Element | undefined>
  closePanel(): void
}

const FLOATING_COMPONENTS = { chat: ChatPanel, rtc: RtcPanel } as const
const FloatingContext = createContext<FloatingContextValue>()

export function useFloatingContext(): FloatingContextValue | undefined
export function useFloatingContext(required: true): FloatingContextValue
export function useFloatingContext(required = false) {
  const context = useContext(FloatingContext)
  if (required && context === undefined) throw new Error('useFloatingContext must be used within a FloatingPanel')
  if (required) return context!
  return context
}

export function FloatingPanel(props: Doc<'floating_panels'>) {
  const { closeFloatingPanel } = useGlobalState()
  const { draggable, ref, handleRef } = useDraggable({
    get id() {
      return props.positionId
    },
  })
  const { data: position } = useQuery(api.floatingPanels.position, { id: props.positionId }, { keepPreviousData: true })

  return (
    <Portal>
      <FloatingContext.Provider
        value={{
          draggable,
          handleRef,
          floatingPanel: props,
          closePanel() {
            closeFloatingPanel(props._id)
          },
        }}
      >
        <div
          id={props.positionId}
          ref={ref}
          class="shadow-[0_0_5px_3px] shadow-transparent py-0! focus:border-tint-primary/10 focus-within:border-tint-primary/10 rounded-base  data-dnd-dragging:not-data-dnd-dropping:border-tint-primary/10 focus-within:shadow-shade-primary/30 data-dnd-dragging:not-data-dnd-dropping:shadow-shade-primary/30 focus:shadow-shade-primary/30 fixed top-0 left-0 z-1000 transition-[border,box-shadow] ease-out duration-100 data-dnd-dropping:duration-0"
          style={{
            transform: `translate(${position()?.x ?? 0}px, ${position()?.y ?? 0}px)`,
            'z-index': `${position()?.zIndex ?? 0}`,
          }}
        >
          <Dynamic component={FLOATING_COMPONENTS[props.type]} chatId={props.chatId} />
        </div>
      </FloatingContext.Provider>
    </Portal>
  )
}
