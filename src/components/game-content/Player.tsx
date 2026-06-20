import { api } from '@/convex/api'
import { env } from '@/env'
import { cn } from '@/lib/utils'
import { useQuery } from 'convex-solidjs'
import { createEffect, createMemo } from 'solid-js'
import { useGlobalState } from '../GlobalStateContext'

const DEBUG = false

export function Player() {
  const { setPlayer, player, keyPressed } = useGlobalState()
  const lastFacingDirection = createMemo((lastDirection) => {
    if (!keyPressed.a && !keyPressed.d) return lastDirection
    return keyPressed.a ? 'left' : 'right'
  }, 'right')

  createEffect(() => {
    if (!player.ref) return
    player.ref.style.setProperty('--facing-dir', lastFacingDirection() === 'left' ? '-1' : '1')
  })

  if (env.VITE_OFFLINE === false) {
    let hydrated = false
    const { data } = useQuery(api.users.current, {})
    createEffect(() => {
      const d = data()
      if (!d || hydrated) return
      setPlayer({ x: d.x, y: d.y })
      hydrated = true
    })
  }

  return (
    <span
      ref={(el) => setPlayer('ref', el)}
      class={cn(
        'player player-idle',
        (keyPressed.d || keyPressed.a) && 'player-walk',
        DEBUG && 'border-2 border-blue-600',
      )}
    />
  )
}
