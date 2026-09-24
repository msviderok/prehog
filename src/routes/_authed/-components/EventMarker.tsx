import { PressE } from '@/components/ui/button';
import { createPolygonClipPath, random } from '@/lib/utils';
import { assets } from '@/routeAssets.gen';
import { Index, Show, type Ref } from 'solid-js';
import { useGlobalState } from './GlobalStateContext';

const POLYGON_SIDES = 14
const POLYGON_ARR = Array.from({ length: POLYGON_SIDES }, (_, i) => i)
const POLYGON_BOTTOM_PLANE_CLIP_PATH = createPolygonClipPath(POLYGON_SIDES)

export interface EventMarkerProps {
  ref?: Ref<HTMLDivElement>
  onInteract?: () => void
  /** @default "Interact" */
  label?: string
}

export function EventMarker(props: EventMarkerProps) {
  const { misc } = useGlobalState()
  return (
    <div class="marker" style={{ '--delay': random(1, 10) }} ref={props.ref}>
      <div
        class="marker-polygons"
        style={{ '--len': POLYGON_SIDES, '--bottom-clip-path': POLYGON_BOTTOM_PLANE_CLIP_PATH }}
      >
        <Index each={POLYGON_ARR}>{(_, idx) => <span style={{ '--i': `${idx}` }} />}</Index>
      </div>

      <Show when={props.onInteract && props.label}>
        <div
          class="marker-floating-action bg-glass-black/20 border-glass-black/20 border-2 rounded-xl bg-size-[100%]"
          style={{
            'background-image': `url(${assets['//']['bg_pattern.png'].src})`,
            '--ty': `-${misc.player.size.height * 1.3}px`,
          }}
        >
          <PressE onPress={() => props.onInteract?.()} />
          <span class="comic text-scaled-3xl comic-ph-light-cornflower-blue comic-shadow-ph-dark-cornflower-blue">
            {props.label ?? 'Interact'}
          </span>
        </div>
      </Show>
    </div>
  )
}
