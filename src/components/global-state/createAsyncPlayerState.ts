import { api } from '@/convex/api'
import { useMutation, useQuery } from 'convex-solidjs'
import { batch, createEffect } from 'solid-js'
import { createStore } from 'solid-js/store'
import type { SceneState } from './createSceneState'

export type PlayerState = ReturnType<typeof createAsyncPlayerState>
export function createAsyncPlayerState(props: { loaded: boolean; onLoaded: () => void }) {
  const [position, setPosition] = createStore({ x: 0, y: 0 })
  const [player, setPlayer] = createStore({
    position,
    setPosition,
    ref: null as unknown as HTMLElement,
    size: 300,
    get rect() {
      return this.ref.getBoundingClientRect()
    },
    setRef(el: HTMLElement) {
      setPlayer('ref', el)
    },
  })

  const createGameState = useMutation(api.usersGameState.create)
  const { data: myInitialPosition } = useQuery(api.usersGameState.findMyInitialPosition, {}, () => ({
    enabled: props.loaded === false,
  }))

  createEffect(() => {
    /* If the data is already loaded then ignore */
    if (props.loaded) return

    const pos = myInitialPosition()

    /* If the initial position is undefined – it hasn't been fetched yet  */
    if (pos === undefined) return

    /**
     * If the initial position is null – there is no state for the user created yet.
     * Then we need to create it and wait for this effect to rerun;
     */
    if (pos === null) {
      createGameState.mutate({})
      return
    }

    batch(() => {
      setPosition(pos)
      props.onLoaded()
    })
  })

  return player
}

export function getPlayerRealPosition(position: PlayerState['position'], scene: SceneState['state']) {
  return {
    x: position.x * scene.worldUnit.x,
    y: position.y * scene.worldUnit.y,
  }
}
