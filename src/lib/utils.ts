import { clsx, type ClassValue } from 'clsx'
import { mergeProps, type JSX } from 'solid-js'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

type Simplify<T> = T extends any ? { [K in keyof T]: T[K] } : T
type OnlyDeclaredProps<P, D extends Partial<P>> = {
  -readonly [K in keyof D]-?: D[K] | Exclude<P[K extends keyof P ? K : never], undefined>
}

export type PropsMergeWithDefault<P, D extends Partial<P>> = Simplify<{
  [K in keyof (P & OnlyDeclaredProps<P, D>)]: K extends keyof D
    ? OnlyDeclaredProps<P, D>[K]
    : P[K extends keyof P ? K : never]
}>

export function defaultProps<P, D extends Partial<P>, C extends { [K in Extract<keyof D, keyof P> as keyof D]?: D[K] }>(
  props: P,
  defaults: D extends C ? D : C,
) {
  return mergeProps(defaults, props) as PropsMergeWithDefault<P, D>
}

export function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}

export function clamp(min: number, val: number, max: number) {
  return Math.max(Math.min(max, Math.max(min, val)), 0)
}

export function callEventHandler<T, E extends Event>(
  handler: JSX.EventHandlerUnion<T, E> | undefined,
  event: E & { currentTarget: T; target: Element },
) {
  if (!handler) return
  if (typeof handler === 'function') {
    handler(event)
  } else {
    handler[0](handler[1], event)
  }
}

export function getLSKey(name: string) {
  return `prehog:${name}`
}

const RTC_PANEL_WIDTH = 400
const RTC_PANEL_HEIGHT = 320
export function getNewPanelPosition(target: Element | EventTarget | null) {
  if (target == null) return { x: 0, y: 0 }
  const x = Math.round(window.innerWidth / 2 - RTC_PANEL_WIDTH / 2)
  const y = Math.round(window.innerHeight / 2 - RTC_PANEL_HEIGHT / 2)
  return { x, y }
}

export function fastRound(n: number) {
  return Math.round((n + Number.EPSILON) * 100) / 100
}

export function access<T extends MaybeAccessor<T>>(value: T): T extends Function ? ReturnType<T> : T {
  return typeof value === 'function' ? value() : value
}

export function isUserDate(value: LoadingStatus): value is UserData {
  return typeof value !== 'string'
}

// function onCreateNode(e: MouseEvent) {
//   const target = e.target as HTMLElement
//   if (target.dataset.node) {
//     // navigator.clipboard.writeText(JSON.stringify(sceneState.nodes))
//     return
//   }
//   // const x = clamp((e.clientX - sceneState.rect.left) / sceneState.realSceneSize.width, 0, 1)
//   // const y = clamp((e.clientY - sceneState.rect.top) / sceneState.realSceneSize.height, 0, 1)
//   // setSceneState('nodes', sceneState.nodes.length, { x, y })
// }

// // onMount(() => {
// //   document.addEventListener('click', onCreateNode)
// // })

// // onCleanup(() => {
// //   document.removeEventListener('click', onCreateNode)
// // })
