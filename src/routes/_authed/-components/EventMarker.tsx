import { InteractButton } from '@/components/ui/button'
import { createPolygonClipPath, random } from '@/lib/utils'
import { createEffect, createMemo, Index, on, Show, type Ref } from 'solid-js'
import { useGlobalState } from './GlobalStateContext'
import { useRouter } from '@tanstack/solid-router'
import { useSceneryPopoverNode } from './SceneryPopoverContext'
import { SOUNDS } from '@/audio'

const POLYGON_SIDES = 14
const POLYGON_ARR = Array.from({ length: POLYGON_SIDES }, (_, i) => i)
const POLYGON_BOTTOM_PLANE_CLIP_PATH = createPolygonClipPath(POLYGON_SIDES)

export interface EventMarkerProps {
  ref?: Ref<HTMLDivElement>
  onInteract?: (node: SceneNodePopover) => void
  /** @default "Interact" */
  label?: string
  /**
   * @default Positioned based on the marker position:
   *  - x = marker position `x`
   *  - y = marker position `y` - (player height * 1.3 WUy)
   */
  interactPillPosition?: Coords
  preloadRoute?: CurrentScene
}

export function EventMarker(props: EventMarkerProps) {
  const node = useSceneryPopoverNode()
  const { misc, scene } = useGlobalState()
  const y = createMemo(() => (props.interactPillPosition?.y ?? misc.player.size.height * 1.3 * -1) * scene.worldUnit.y)
  const x = createMemo(() => (props.interactPillPosition?.x ?? 0) * scene.worldUnit.x)

  if (props.preloadRoute) {
    const router = useRouter()
    createEffect(
      on(
        () => node.collided.get(),
        (isOpen) => isOpen && void router.preloadRoute({ to: `/${props.preloadRoute}` }),
      ),
    )
  }

  createEffect(
    on(
      () => node.collided.get(),
      (isOpen, prevIsOpen) => {
        if (prevIsOpen == null) return
        SOUNDS.effects[isOpen ? 'markerEnter' : 'markerLeave'].play()
      },
    ),
  )

  return (
    <div class="marker" style={{ '--delay': random(1, 10), '--collided': +node.collided.get() }} ref={props.ref}>
      <div
        class="marker-polygons"
        style={{ '--len': POLYGON_SIDES, '--bottom-clip-path': POLYGON_BOTTOM_PLANE_CLIP_PATH }}
      >
        <Index each={POLYGON_ARR}>{(_, idx) => <span style={{ '--i': `${idx}` }} />}</Index>
      </div>

      <Show when={props.onInteract}>
        <div class="marker-floating-action" style={{ '--ty': `${y()}px`, '--tx': `${x()}px` }}>
          <InteractButton onPress={() => props.onInteract?.(node)} label={props.label} />
        </div>
      </Show>
    </div>
  )
}
