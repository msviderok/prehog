import { cn } from '@/lib/utils'
import { useQuery } from 'convex-solidjs'
import { createEffect, createMemo } from 'solid-js'
import { api } from '../../../convex/_generated/api'
import { useGlobalState } from '../GlobalStateContext'

const DEBUG = false

export function Player() {
  let hydrated = false
  const { setPlayer, player, keyPressed } = useGlobalState()
  const { data } = useQuery(api.users.current, {})
  const lastFacingDirection = createMemo((lastDirection) => {
    if (!keyPressed.a && !keyPressed.d) return lastDirection
    return keyPressed.a ? 'left' : 'right'
  }, 'right')

  createEffect(() => {
    if (!player.ref) return
    player.ref.style.setProperty('--facing-dir', lastFacingDirection() === 'left' ? '-1' : '1')
  })

  createEffect(() => {
    const d = data()
    if (!d || hydrated) return
    setPlayer({ x: d.x, y: d.y })
    hydrated = true
  })

  return (
    <span
      ref={(el) => {
        setPlayer('ref', el)
      }}
      class={cn(
        'player player-idle',
        (keyPressed.d || keyPressed.a) && 'player-walk',
        DEBUG && 'border-2 border-blue-600',
      )}
    />
  )
}
