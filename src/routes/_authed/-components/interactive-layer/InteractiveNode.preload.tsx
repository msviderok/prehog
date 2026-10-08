import { preloadAsset } from '@/lib/utils'
import { type Asset, type Assets } from '@/routeAssets.gen'
import { useRouter } from '@tanstack/solid-router'
import { createEffect, on } from 'solid-js'
import { useInteractiveNode } from './context'

export function Route(props: { route: CurrentScene }) {
  const router = useRouter()
  const { node } = useInteractiveNode<'popover'>()

  createEffect(
    on(
      () => node.collided(),
      (isOpen) => isOpen && void router.preloadRoute({ to: `/${props.route}` }),
    ),
  )

  return null
}

export function Asset<K extends keyof Assets, A extends keyof Assets[K]>(props: Asset<K, A>) {
  const { node } = useInteractiveNode<'popover'>()

  createEffect(
    on(
      () => node.collided(),
      (isOpen) => isOpen && preloadAsset(props),
    ),
  )

  return null
}
