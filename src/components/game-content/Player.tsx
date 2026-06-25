import { api } from '@/convex/api'
import { env } from '@/env'
import { useQuery } from 'convex-solidjs'
import { createEffect, createMemo } from 'solid-js'
import { useGlobalState } from '../GlobalStateContext'

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

  createEffect(() => {
    if (!player.ref) return
    player.ref.classList.toggle('player-walk', keyPressed.d || keyPressed.a)
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

  return <span ref={(el) => setPlayer('ref', el)} class="player player-idle" />
}
