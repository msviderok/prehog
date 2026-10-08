import { SOUNDS } from '@/audio'
import { InteractButton } from '@/components/ui/button'
import { createPolygonClipPath, random } from '@/lib/utils'
import { createEffect, createMemo, Index, on, onCleanup, type ParentProps } from 'solid-js'
import { useGlobalState } from '../GlobalStateContext'
import { useInteractiveNode } from './context'

const POLYGON_SIDES = 14
const POLYGON_ARR = Array.from({ length: POLYGON_SIDES }, (_, i) => i)
const POLYGON_BOTTOM_PLANE_CLIP_PATH = createPolygonClipPath(POLYGON_SIDES)

export function Root(props: ParentProps<{ x: number; y: number }>) {
  const { id } = useInteractiveNode()
  const { registerSlot, unregisterSlot } = useGlobalState()
  registerSlot(id, 'marker', () => <EventMarker {...props} />)
  onCleanup(() => unregisterSlot(id, 'marker'))
  return null
}

function EventMarker(props: ParentProps<{ x: number; y: number }>) {
  const { scene, misc } = useGlobalState()
  const { node } = useInteractiveNode()

  const hitbox = createMemo(
    on(
      () => scene.currentScene(),
      () => {
        return {
          hitbox: {
            x1: props.x - misc.eventMarker.r,
            x2: props.x + misc.eventMarker.r,
            y1: props.y - misc.eventMarker.h,
            y2: props.y + misc.eventMarker.h,
          },
          get width() {
            return this.hitbox.x2 - this.hitbox.x1
          },
          get height() {
            return this.hitbox.y2 - this.hitbox.y1
          },
        }
      },
    ),
  )

  createEffect(
    on(hitbox, (hb) => {
      node.hitbox = hb.hitbox
      node.size.width = hb.width
      node.size.height = hb.height
    }),
  )

  createEffect(
    on(
      () => node.collided(),
      (isOpen, prevIsOpen) => {
        if (prevIsOpen == null) return
        SOUNDS.effects[isOpen ? 'markerEnter' : 'markerLeave'].play()
      },
    ),
  )

  return (
    <div
      class="marker"
      style={{
        '--delay': random(1, 10),
        '--collided': +node.collided(),
        '--node-tx': hitbox().hitbox.x1,
        '--node-ty': hitbox().hitbox.y1,
        '--node-width': hitbox().width,
        '--node-height': hitbox().height,
      }}
    >
      <div
        class="marker-polygons"
        style={{ '--len': POLYGON_SIDES, '--bottom-clip-path': POLYGON_BOTTOM_PLANE_CLIP_PATH }}
      >
        <Index each={POLYGON_ARR}>{(_, idx) => <span style={{ '--i': `${idx}` }} />}</Index>
      </div>
      {props.children}
    </div>
  )
}

export function Pill(props: {
  /** @default "Interact" */
  label?: string
  onInteract: (node: InteractiveNode) => void
  /** @default "x" of the marker */
  offsetX?: number
  /** @default "y" of the marker - (player height * 1.3 WUy) */
  offsetY?: number
}) {
  const { node } = useInteractiveNode()
  const { misc, scene } = useGlobalState()
  const y = createMemo(() => (props.offsetY ?? misc.player.size.height * 1.3 * -1) * scene.worldUnit.y)
  const x = createMemo(() => (props.offsetX ?? 0) * scene.worldUnit.x)
  return (
    <div class="marker-floating-action" style={{ '--ty': `${y()}px`, '--tx': `${x()}px` }}>
      <InteractButton onPress={() => props.onInteract?.(node)} label={props.label} />
    </div>
  )
}
