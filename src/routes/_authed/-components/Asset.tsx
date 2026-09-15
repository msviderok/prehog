import { defaultProps } from '@/lib/utils'
import { assets, type Assets, type RouteAsset } from '@/routeAssets.gen'
import { cn } from 'cn'
import { createMemo, splitProps, type JSX } from 'solid-js'
import { useSceneryPopover } from './SceneryPopover'

export interface AssetProps<
  K extends keyof Assets,
  A extends keyof Assets[K],
> extends JSX.HTMLAttributes<HTMLDivElement> {
  routeId: K
  asset: A
  x?: number
  y?: number
  width?: number
  height?: number
  scale?: number
  nodeId?: string
}

export function Asset<K extends keyof Assets, A extends keyof Assets[K]>(componentProps: AssetProps<K, A>) {
  const asset = assets[componentProps.routeId]![componentProps.asset] as RouteAsset
  const props = defaultProps(componentProps, { style: { '--asset-url': `url(${asset.src})` } })
  const [local, rest] = splitProps(props, ['routeId', 'asset', 'width', 'height', 'scale', 'x', 'y', 'class', 'nodeId'])

  const sceneryPopoverCtx = useSceneryPopover()
  const isOpen = createMemo(() => {
    if (!props.nodeId) return false
    const openAccessor = sceneryPopoverCtx.isOpen(props.nodeId)
    return openAccessor()
  })

  return (
    <div
      class={cn('asset', local.class)}
      data-x={local.x}
      data-y={local.y}
      data-open={isOpen()}
      data-width={(local.width ?? asset.size.width) * (local.scale ?? 1)}
      data-height={(local.height ?? asset.size.height) * (local.scale ?? 1)}
      {...rest}
    />
  )
}
