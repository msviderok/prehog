import type { Doc } from '@/convex/dataModel'
import type { Draggable } from '@dnd-kit/dom'
import { createContext, useContext, type Setter } from 'solid-js'

interface FloatingContextValue {
  floatingPanel: Doc<'floating_panels'>
  draggable: Draggable
  handleRef: Setter<Element | undefined>
  closePanel(): void
}

export const FloatingContext = createContext<FloatingContextValue>()

export function useFloatingContext(): FloatingContextValue | undefined
export function useFloatingContext(required: true): FloatingContextValue
export function useFloatingContext(required = false) {
  const context = useContext(FloatingContext)
  if (required && context === undefined) throw new Error('useFloatingContext must be used within a FloatingPanel')
  if (required) return context!
  return context
}
