import { defaultProps } from '@/lib/utils'
import { assets, type Assets, type RouteAsset } from '@/routeAssets.gen'
import { cn } from 'cn'
import { splitProps, type JSX } from 'solid-js'
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
  const props = defaultProps(componentProps, { style: { 'background-image': `url(${asset.src})` } })
  const [local, rest] = splitProps(props, ['routeId', 'asset', 'width', 'height', 'scale', 'x', 'y', 'class', 'nodeId'])

  const sceneryPopoverCtx = useSceneryPopover()
  const isOpen = props.nodeId ? sceneryPopoverCtx.isOpen(props.nodeId) : null

  return (
    <div
      class={cn(
        'asset',
        isOpen != null &&
          cn(
            'origin-center',
            isOpen() &&
              '[--c:var(--ph-warm-pink)] [--cc:var(--ph-mustard-yellow)] drop-shadow-[0_0_1px_var(--c),0_0_2px_var(--cc),0_0_3px_var(--c),0_0_4px_var(--cc),0_0_5px_var(--c)]',
          ),
        local.class,
      )}
      data-x={local.x}
      data-y={local.y}
      data-width={(local.width ?? asset.size.width) * (local.scale ?? 1)}
      data-height={(local.height ?? asset.size.height) * (local.scale ?? 1)}
      {...rest}
    />
  )
}
