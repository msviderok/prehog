import { type ClassValue, clsx } from 'clsx'
import { mergeProps } from 'solid-js'
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
  // eslint-disable-next-line solid/reactivity
  return mergeProps(defaults, props) as PropsMergeWithDefault<P, D>
}

/**
 * Scales the content to fit the container.
 * @param contentHeight - The height of the content.
 * @param containerHeight - The height of the container (_default_: `window.innerHeight`)
 */
export function scaleToFit(contentHeight: number, containerHeight?: number) {
  if (containerHeight === undefined) {
    containerHeight = typeof window !== 'undefined' ? window.innerHeight : 0
  }
  return containerHeight < contentHeight ? containerHeight / contentHeight : 1
}

export function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}

export function clamp(val: number, min: number, max: number) {
  return Math.min(max, Math.max(min, val))
}
