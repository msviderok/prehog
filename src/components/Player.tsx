import { useQuery } from 'convex-solidjs'
import { createEffect } from 'solid-js'
import { api } from '../../convex/_generated/api'
import { useGlobalState } from './GlobalStateContext'

export function Player() {
  let hydrated = false
  const { setMe } = useGlobalState()
  const { data } = useQuery(api.users.current, {})

  createEffect(() => {
    const d = data()
    if (!d || hydrated) return
    setMe({ x: d.x, y: d.y })
    hydrated = true
  })

  return (
    <span
      ref={(el) => setMe('ref', el)}
      class="z-10 h-20 w-8 bg-red-300 absolute border-2 border-blue-800 rounded-sm"
    />
  )
}
