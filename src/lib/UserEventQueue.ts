export class UserEventQueue<T> {
  private items: T[] = []
  private head = 0

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
