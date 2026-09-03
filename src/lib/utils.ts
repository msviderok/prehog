import { routeAssets, type RouteAssets } from '@/route-assets.gen'
import type { AnyRoute } from '@tanstack/solid-router'
import { mergeProps, type JSX } from 'solid-js'
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

export function isUserDate(value: LoadingStatus): value is UserData {
  return typeof value !== 'string'
}

export function createPolygonClipPath(sides: number): JSX.CSSProperties['clip-path'] {
  const radius = 50 // 50%
  const points = []
  const offset = 90 - 180 / sides

  for (let i = 0; i < sides; i++) {
    const angle = offset + (i * 360) / sides
    const radians = (angle * Math.PI) / 180
    const x = radius * Math.cos(radians)
    const y = radius * Math.sin(radians)
    const xPercent = fastRound(50 + x)
    const yPercent = fastRound(50 + y)
    points.push(`${xPercent}% ${yPercent}%`)
  }

  return `polygon(${points.join(', ')})`
}

export function random(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}
