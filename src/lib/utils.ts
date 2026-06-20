import { clsx, type ClassValue } from 'clsx'
import { children, mergeProps, type JSX } from 'solid-js'
import { twMerge } from 'tailwind-merge'
import { GAME_CONTENT_HEIGHT_RATIO } from './constants'

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

/**
 * Scales the content to fit the container.
 * @param contentHeight - The height of the content.
 * @param containerHeight - The height of the container (_default_: `window.innerHeight`)
 */
export function scaleToFit(contentHeight: number, containerHeight?: number) {
  if (containerHeight === undefined) {
    containerHeight = typeof window !== 'undefined' ? getGameContentHeight() : 0
  }
  return containerHeight < contentHeight ? containerHeight / contentHeight : 1
}

export function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}

export function clamp(val: number, min: number, max: number) {
  return Math.min(max, Math.max(min, val))
}

export function collisionDetected<T extends { left: number; top: number; right: number; bottom: number }>(a: T, b: T) {
  return a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top
}

export function createRectFromCoords({ x1, y1, x2, y2 }: { x1: number; y1: number; x2: number; y2: number }): DOMRect {
  return {
    x: x1,
    y: y1,
    left: x1,
    top: y1,
    width: x2 - x1,
    height: y2 - y1,
    right: x2,
    bottom: y2,
    toJSON() {
      return JSON.stringify(this)
    },
  }
}

// https://github.com/solidjs/solid/issues/2478#issuecomment-2888503241
export function childrenLazy(resolver: () => JSX.Element) {
  const _s = Symbol()
  let x: any = _s
  return () => {
    if (x === _s) {
      x = children(resolver)
    }
    return x
  }
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

export function getGameContentHeight() {
  return window.innerHeight * GAME_CONTENT_HEIGHT_RATIO
}
