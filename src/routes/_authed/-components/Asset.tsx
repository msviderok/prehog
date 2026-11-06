import { defaultProps } from '@/lib/utils'
import { assets, type Assets, type Asset as AssetItem, type RouteAsset } from '@/routeAssets.gen'
import { cn } from 'cn'
import { createMemo, splitProps, type JSX } from 'solid-js'
import { useInteractiveNodeContext } from './interactive-layer/context'

export interface AssetProps<K extends keyof Assets, A extends keyof Assets[K]>
  extends AssetItem<K, A>, JSX.HTMLAttributes<HTMLDivElement> {
  x?: number
  y?: number
  width?: number
  height?: number
  scale?: number
  repeat?: boolean | 'x' | 'y'
  rotate?: number
}

export function Asset<K extends keyof Assets, A extends keyof Assets[K]>(componentProps: AssetProps<K, A>) {
  const asset = assets[componentProps.routeId]![componentProps.asset] as RouteAsset
  const props = defaultProps(componentProps, { style: { '--asset-url': `url(${asset.src})` } })
  const [local, rest] = splitProps(props, [
    'routeId',
    'asset',
    'width',
    'height',
    'scale',
    'x',
    'y',
    'class',
    'repeat',
    'rotate',
  ])

  const node = useInteractiveNodeContext()
  const isOpen = createMemo(() => node?.node.collided())

  return (
    <div
      class={cn(
        'asset',
        local.repeat && 'after:bg-auto',
        local.repeat === true && 'after:bg-repeat',
        local.repeat === 'x' && 'after:bg-repeat-x',
        local.repeat === 'y' && 'after:bg-repeat-y',
        local.class,
      )}
      data-x={local.x}
      data-y={local.y}
      data-rotate={local.rotate}
      data-open={isOpen()}
      data-width={(local.width ?? asset.size.width) * (local.scale ?? 1)}
      data-height={(local.height ?? asset.size.height) * (local.scale ?? 1)}
      {...rest}
    />
  )
}
