import { defaultProps } from '@/lib/utils'
import { assets, type RouteAsset } from '@/routeAssets.gen'
import { cn } from 'cn'
import { splitProps, type JSX } from 'solid-js'

type Assets = typeof assets

interface AssetProps<K extends keyof Assets, A extends keyof Assets[K]> extends JSX.HTMLAttributes<HTMLDivElement> {
  routeId: K
  asset: A
  width?: number
  height?: number
  scale?: number
}

export function Asset<K extends keyof Assets, A extends keyof Assets[K]>(componentProps: AssetProps<K, A>) {
  const asset = assets[componentProps.routeId]![componentProps.asset] as RouteAsset
  const props = defaultProps(componentProps, { style: { 'background-image': `url(${asset.src})` } })
  const [local, rest] = splitProps(props, ['routeId', 'asset', 'width', 'height', 'scale', 'class'])
  return (
    <div
      class={cn('asset absolute top-0 left-0 translate-10', local.class)}
      data-width={(local.width ?? asset.size.width) * (local.scale ?? 1)}
      data-height={(local.height ?? asset.size.height) * (local.scale ?? 1)}
      {...rest}
    />
  )
}
