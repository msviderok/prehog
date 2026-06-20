import { createEffect } from 'solid-js'
import { createStore } from 'solid-js/store'

export type PlayerState = ReturnType<typeof createPlayerState>

const LSK_ME_POSITION = 'me_position'

export function createPlayerState() {
  const [player, setPlayer] = createStore({
    ref: null as unknown as HTMLElement,
    x: 0,
    y: 85,
    size: 300,
    get rect() {
      return this.ref.getBoundingClientRect()
    },
  })

  createEffect(() => {
    localStorage.setItem(LSK_ME_POSITION, JSON.stringify({ x: player.x, y: player.y }))
  })

  return { player, setPlayer }
}

export function getPlayerRealPosition(player: PlayerState['player'], scene: GlobalState.Scene) {
  return {
    x: player.x * scene.worldUnit.x,
    y: player.y * scene.worldUnit.y,
  }
}
