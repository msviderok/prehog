import { cn } from 'cn'
import { splitProps, type ComponentProps } from 'solid-js'
import { useGlobalState } from '../GlobalStateContext'
import { useSceneContext } from '../Scene.context'
import { useInteractiveNode } from './context'

export function Dialog(props: ComponentProps<'div'>) {
  const [local, rest] = splitProps(props, ['class', 'ref'])
  const { gameState, dialog } = useGlobalState()
  const { id } = useInteractiveNode<'popover'>()
  const sceneName = useSceneContext()
  gameState.scene(sceneName).nodes.registerSlot(id, 'dialogContent', () => (
    <div
      class={cn('relative flex items-center justify-center rounded-3xl', local.class)}
      ref={(el) => {
        typeof local.ref === 'function' ? local.ref(el) : (local.ref = el)
        dialog.ref = el
      }}
      {...rest}
    />
  ))
  return null
}
