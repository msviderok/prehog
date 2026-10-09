import type { Assets } from '@/routeAssets.gen'
import { onCleanup } from 'solid-js'
import { Asset as AssetOriginal, type AssetProps } from '../Asset'
import { useGlobalState } from '../GlobalStateContext'
import { useInteractiveNode } from './context'

export function Asset<K extends keyof Assets, A extends keyof Assets[K]>(props: AssetProps<K, A>) {
  const { id } = useInteractiveNode()
  const { nodes } = useGlobalState()
  nodes.registerSlot(id, 'asset', () => <AssetOriginal {...props} />)
  onCleanup(() => nodes.unregisterSlot(id, 'asset'))
  return null
}
