import { routeAssets, type RouteAssets } from '@/route-assets.gen'
import type { AnyRoute } from '@tanstack/solid-router'

type RouteId<R> = R extends { id: infer I } ? (I extends keyof RouteAssets ? I : never) : never
type AssetsFor<R> = RouteAssets[RouteId<R>]

export function useRouteAssets<R extends keyof RouteAssets>(routeId: R): RouteAssets[R]
export function useRouteAssets<R extends AnyRoute>(route: R): AssetsFor<R>
export function useRouteAssets<R extends AnyRoute | keyof RouteAssets>(routeOrRouteId: R): AssetsFor<R> {
  const k = typeof routeOrRouteId === 'string' ? routeOrRouteId : routeOrRouteId.id
  const map = routeAssets[k as RouteId<R>]
  return Object.fromEntries(Object.entries(map).map(([path, value]) => [path.split('/').pop()!, value])) as AssetsFor<R>
}
