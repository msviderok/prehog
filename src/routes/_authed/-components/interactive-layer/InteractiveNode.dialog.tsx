import { onCleanup, type ParentProps } from 'solid-js'
import { useGlobalState } from '../GlobalStateContext'
import { useInteractiveNode } from './context'
import { useSceneContext } from '../Scene.context'

export function Dialog(props: ParentProps) {
  const { gameState } = useGlobalState()
  const { id } = useInteractiveNode<'popover'>()
  const sceneName = useSceneContext()
  gameState.scene(sceneName).nodes.registerSlot(id, 'dialogContent', () => <>{props.children}</>)
  return null
}
