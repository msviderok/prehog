import { useClerk } from 'clerk-solidjs-tanstack-start'
import { createEffect, createMemo } from 'solid-js'
import { useGlobalState } from '../global-state/GlobalStateContext'

export function Player() {
  const { player, keyboard } = useGlobalState()
  const clerk = useClerk()
  const lastFacingDirection = createMemo((lastDirection) => {
    if (!keyboard.keyPressed.a && !keyboard.keyPressed.d) return lastDirection
    return keyboard.keyPressed.a ? 'left' : 'right'
  }, 'right')

  createEffect(() => {
    if (!player.ref) return
    player.ref.style.setProperty('--facing-dir', lastFacingDirection() === 'left' ? '-1' : '1')
  })

  createEffect(() => {
    if (!player.ref) return
    player.ref.classList.toggle('player-walk', keyboard.keyPressed.d || keyboard.keyPressed.a)
    player.ref.classList.toggle('player-idle', !keyboard.keyPressed.d && !keyboard.keyPressed.a)
  })

  return (
    <div ref={player.setRef} class="player">
      <span class="hat" />
    </div>
  )
}
