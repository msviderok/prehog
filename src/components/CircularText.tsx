import { defaultProps } from '@/lib/utils'
import { cn } from 'cn'
import { createMemo, createSignal, Index } from 'solid-js'
import { Motion } from 'solid-motionone'

export function CircularText(componentProps: { text: string; spinDuration?: number; class?: string }) {
  const props = defaultProps(componentProps, { spinDuration: 10 })
  const letters = createMemo(() => Array.from(props.text))
  const len = createMemo(() => letters().length)
  const [rotation, setRotation] = createSignal(0)

  return (
    <Motion.div
      class={cn(
        'size-full absolute top-0 font-black text-accent text-center cursor-pointer origin-center',
        props.class,
      )}
      // animate={{ rotate: [10, 0, -10, 0, 10] }}
      transition={{
        rotate: {
          duration: 3,
          repeat: Infinity,
          easing: 'ease-in-out',
        },
      }}
    >
      <Index each={letters()}>
        {(letter, i) => {
          const rotationDeg = -60 + (120 * i) / (len() - 1)

          const factor = Math.PI / len()
          const x = factor * i
          const y = factor * i
          const transform = `rotateX(180deg) rotateY(0deg) rotateZ(${rotationDeg}deg) translate3d(${x}px, ${y}px, 0)`

          return (
            <span
              class="absolute inline-block inset-0 text-xl transition-all duration-500 ease-[cubic-bezier(0,0,0,1)]"
              style={{ transform, '-webkit-transform': transform }}
            >
              {letter()}
            </span>
          )
        }}
      </Index>
    </Motion.div>
  )
}
