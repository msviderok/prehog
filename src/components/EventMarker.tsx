import { createPolygonClipPath } from '@/lib/utils'
import { createSignal, Index, type Ref } from 'solid-js'

const POLYGON_SIDES = 20
const POLYGON_ARR = Array.from({ length: POLYGON_SIDES }, (_, i) => i)
const POLYGON_BOTTOM_PLANE_CLIP_PATH = createPolygonClipPath(POLYGON_SIDES)

export function EventMarker(props: { ref: Ref<HTMLDivElement> }) {
  const [r, setR] = createSignal(20)
  return (
    <>
      <div class="marker" ref={props.ref} style={{ '--rot': `${r()}deg` }}>
        <div style={{ '--len': POLYGON_SIDES, '--bottom-clip-path': POLYGON_BOTTOM_PLANE_CLIP_PATH }}>
          <Index each={POLYGON_ARR}>{(_, idx) => <span style={{ '--i': `${idx}` }} />}</Index>
          {/*<span data-side="bottom" />
          <span data-side="top" />
          <span data-side="left" />
          <span data-side="right" />
          <span data-side="front" />
          <span data-side="back" />*/}
        </div>
      </div>
      <input
        class="fixed top-0 left-0"
        type="range"
        min="0"
        max="360"
        value={r()}
        onInput={(e) => setR(parseInt(e.target.value))}
      />
    </>
  )
}
