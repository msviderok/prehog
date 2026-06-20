import { createEffect, on, onMount, type Accessor, type Setter, type Signal } from 'solid-js'

export class Queue<T> {
  private items: T[]
  private head: number
  private processedItems: Set<T>
  // private reactiveItems: Accessor<T[]>

  constructor(reactiveItemsSignal: Signal<T[]>) {
    this.items = []
    this.head = 0
    this.processedItems = new Set()

    // const [accessor] = reactiveItemsSignal

    // createEffect(
    //   on(accessor, (newItems) => {
    //     for (const newItem of newItems) {
    //       if (this.processedItems.has(newItem)) continue

    //       this.processedItems.add(newItem)
    //       this.push(newItem)
    //     }
    //   }),
    // )
  }

  public push(item: T) {
    this.items.push(item)
  }

  public shift(): T | undefined {
    if (this.head > this.items.length) return undefined

    const item = this.items[this.head]
    this.head += 1

    // Occasionally compact to avoid retaining old references forever
    if (this.head > 1024 && this.head * 2 > this.items.length) {
      this.items = this.items.slice(this.head)
      this.head = 0
    }

    return item
  }

  get length() {
    return this.items.length - this.head
  }
}
