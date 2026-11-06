import type { Assets } from '@/routeAssets.gen'
import { Asset as AssetOriginal, type AssetProps } from '../Asset'
import { useGlobalState } from '../GlobalStateContext'
import { useSceneContext } from '../Scene.context'
import { useInteractiveNode } from './context'

export function Asset<K extends keyof Assets, A extends keyof Assets[K]>(props: AssetProps<K, A>) {
  const { id } = useInteractiveNode()
  const { gameState } = useGlobalState()
  const sceneName = useSceneContext()
  gameState.scene(sceneName).nodes.registerSlot(id, 'asset', () => <AssetOriginal {...props} />)
  return null
}
