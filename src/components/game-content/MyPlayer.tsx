import { createEffect, createMemo, on } from 'solid-js'
import { useGlobalState } from '../global-state/GlobalStateContext'
import { Hat } from './Hat'
import { useMutation } from 'convex-solidjs'
import { api } from '@/convex/api'

export function MyPlayer() {
  const { player, keyboard } = useGlobalState()
  const setDirection = useMutation(api.gameState.setDirection)
  const setIsWalking = useMutation(api.gameState.setIsWalking)
  const lastFacingDirection = createMemo<'left' | 'right'>((lastDirection) => {
    if (!keyboard.keyPressed.a && !keyboard.keyPressed.d) return lastDirection
    return keyboard.keyPressed.a ? 'left' : 'right'
  }, 'right')

  createEffect(
    on(lastFacingDirection, (dir) => {
      if (!player.ref) return
      player.ref.style.setProperty('--facing-dir', dir === 'left' ? '-1' : '1')
      void setDirection.mutate({ direction: dir })
    }),
  )

  createEffect(() => {
    if (!player.ref) return
    const isWalking = keyboard.keyPressed.d || keyboard.keyPressed.a
    player.ref.classList.toggle('player-walk', isWalking)
    player.ref.classList.toggle('player-idle', !isWalking)
    void setIsWalking.mutate({ isWalking })
  })

  return (
    <div ref={player.setRef} class="player" data-is-admin={player.isAdmin}>
      <Hat hat={player.isAdmin ? 'admin' : 'baseball'} />
    </div>
  )
}
