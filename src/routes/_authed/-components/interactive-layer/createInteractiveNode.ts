import { createSignal, onCleanup } from 'solid-js'
import { useGlobalState } from '../GlobalStateContext'

export function createInteractiveNode<T extends InteractiveNode['type']>(
  id: string,
  type: T,
  data: InteractiveNodeOf<T>['data'],
): InteractiveNodeOf<T> {
  const { nodes } = useGlobalState()
  const [collided, setCollided] = createSignal(false)
  const [status, setStatus] = createSignal<InteractiveNodeStatus>('idle')

  const node = {
    size: { width: 0, height: 0 },
    hitbox: { x1: 0, y1: 0, x2: 0, y2: 0 },
    collided,
    setCollided,
    status,
    setStatus,
    type,
    data,
  } as InteractiveNodeOf<T>

  nodes.set(id, node)
  onCleanup(() => nodes.delete(id))

  return node
}
