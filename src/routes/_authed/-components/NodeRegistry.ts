import { createStore, produce, reconcile, type SetStoreFunction, type Store } from 'solid-js/store'

type SlotsStore = Record<string, NodeSlots>

export class NodeRegistry {
  #nodes = new Map<string, InteractiveNode>()
  #views = new Map<InteractiveNode['type'], Map<string, InteractiveNode>>()
  #setNodeSlots: SetStoreFunction<SlotsStore>
  public slots: Store<SlotsStore>

  constructor() {
    const [nodeSlots, setNodeSlots] = createStore<SlotsStore>({})
    this.slots = nodeSlots
    this.#setNodeSlots = setNodeSlots

    this.#views.set('player', new Map())
    this.#views.set('popover', new Map())
  }

  get<
    K extends InteractiveNode['type'] | undefined = undefined,
    R = K extends string ? InteractiveNodeOf<K> : InteractiveNode,
  >(id: string): R {
    return this.#nodes.get(id) as R
  }

  keys(): MapIterator<string> {
    return this.#nodes.keys()
  }

  values(): MapIterator<InteractiveNode> {
    return this.#nodes.values()
  }

  entries(): MapIterator<[string, InteractiveNode]> {
    return this.#nodes.entries()
  }

  set<T extends InteractiveNode>(id: string, node: T): this {
    this.#nodes.set(id, node)
    this.#setNodeSlots(id, {})
    const view = this.#views.get(node.type) ?? new Map()
    view.set(id, node)
    return this
  }

  delete(id: string): boolean {
    console.log(id)
    const nodeType = this.#nodes.get(id)!.type
    return this.#nodes.delete(id) && this.#views.get(nodeType)!.delete(id)
  }

  clear(): void {
    this.#nodes.clear()
    this.#setNodeSlots(reconcile({}))
    for (const view of this.#views.values()) view.clear()
  }

  byType<K extends InteractiveNode['type'], R = Map<string, InteractiveNodeOf<K>>>(type: K): R {
    return this.#views.get(type) as R
  }

  registerSlot<K extends keyof NodeSlots>(id: string, slot: K, component: NodeSlots[K]) {
    this.#setNodeSlots(id, slot, () => component)
  }

  unregisterSlot(id: string, slot: keyof NodeSlots) {
    this.#setNodeSlots(
      id,
      produce((draft) => delete draft[slot]),
    )
  }
}
