import type { PopoverContentPositionerProps } from './components/ui/popover'

declare global {
  namespace GlobalState {
    interface KeyPressed {
      w: boolean
      s: boolean
      a: boolean
      d: boolean
      shift: boolean
    }

    interface Player {
      ref: HTMLElement
      rect: DOMRect
      x: number
      y: number
      size: number
      realPosition: {
        x: number
        y: number
      }
    }
  }

  namespace Scene {
    interface CommonNodeProps {
      ref: HTMLElement
      idx: number
      x: number
      y: number
      text: string
      open: boolean
    }

    interface NodePopover extends CommonNodeProps {
      type: 'popover'
      hitbox: DOMRect
      realHitbox: DOMRect
      positioner: PopoverContentPositionerProps
    }

    type Node = NodePopover

    type Nodes = Node[]

    interface State {
      ref: HTMLElement
      rect: DOMRect
      scale: number
      originalWidth: number
      originalHeight: number
      worldUnit: { x: number; y: number }
      realSceneSize: { width: number; height: number }
    }
  }
}

export {}
