import type { Doc, Id } from '@/convex/dataModel'

export function createOnlineUsersState() {
  const data = {
    users: {} as Record<Id<'users'>, { ref: HTMLDivElement; batchQueue: Doc<'game_event_batches'>['batch'] }>,
    get ids() {
      return Object.keys(this.users)
    },
  }

  return { data }
}
