import { createPolygonClipPath, random } from '@/lib/utils'
import { Index, type Ref } from 'solid-js'

const POLYGON_SIDES = 14
const POLYGON_ARR = Array.from({ length: POLYGON_SIDES }, (_, i) => i)
const POLYGON_BOTTOM_PLANE_CLIP_PATH = createPolygonClipPath(POLYGON_SIDES)

export function EventMarker(props: { ref: Ref<HTMLDivElement> }) {
  return (
    <>
      <div class="marker" ref={props.ref} style={{ '--delay': random(1, 10) }}>
        <div style={{ '--len': POLYGON_SIDES, '--bottom-clip-path': POLYGON_BOTTOM_PLANE_CLIP_PATH }}>
          <Index each={POLYGON_ARR}>{(_, idx) => <span style={{ '--i': `${idx}` }} />}</Index>
        </div>
      </div>
    </>
  )
}
