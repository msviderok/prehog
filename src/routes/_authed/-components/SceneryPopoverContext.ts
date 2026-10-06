import { createContext, useContext, type Accessor, type Component } from 'solid-js'
import type { Popover as PopoverPrimitive } from '@msviderok/base-ui-solid/popover'
import type { Store } from 'solid-js/store'

export interface SceneryPopoverItem {
  id: string
  node: SceneNodePopover
  anchor?: {
    ref: HTMLElement
    position: Coords
    component: Component
    side: PopoverPrimitive.Positioner.Props['side']
    align: PopoverPrimitive.Positioner.Props['align']
  }
  marker: {
    ref: HTMLElement
    position: Coords
    component: Component
  }
  content: { ref: HTMLElement; component: Component }
  asset: { ref: HTMLElement; component: Component }
}

export interface RegistryState {
  data: Record<string, SceneryPopoverItem>
  active: { current: string | undefined; last: string | undefined }
  anchors: Component[]
  markers: Component[]
  contents: Component[]
  assets: Component[]
}

export interface SceneryPopoverState {
  registry: Store<RegistryState>
  anchorRef: Accessor<HTMLElement | undefined>
  active: Accessor<SceneryPopoverItem | undefined>
  lastActive: Accessor<SceneryPopoverItem | undefined>
  register(data: SceneryPopoverItem): void
  setActive(id: string): void
  popupRef: HTMLElement
  portalRef: HTMLElement
  backdropRef: HTMLElement
  positionerRef: HTMLElement
  getNode: (id: string) => SceneNodePopover | undefined
  isOpen: (id: string) => Accessor<boolean>
}

export const SceneryPopoverContext = createContext<SceneryPopoverState>()
export const SceneryPopoverNodeContext = createContext<SceneNodePopover>()

export function useSceneryPopover() {
  const ctx = useContext(SceneryPopoverContext)
  if (!ctx) throw new Error('useSceneryPopoverContext must be used within a SceneryPopoverProvider')
  return ctx
}

export function useSceneryPopoverNode() {
  const ctx = useContext(SceneryPopoverNodeContext)
  if (!ctx) throw new Error('useSceneryPopoverNode must be used within a SceneryPopoverProvider')
  return ctx
}
