import { api } from '@/convex/api'
import type { Hat } from '@/lib/constants'
import { useClerk } from 'clerk-solidjs-tanstack-start'
import { useQuery } from 'convex-solidjs'
import { batch, createEffect, createMemo, createSignal, mergeProps, type Accessor } from 'solid-js'
import { createStore } from 'solid-js/store'

export type PlayerState = ReturnType<typeof createAsyncPlayerState>
export function createAsyncPlayerState(props: { loaded: boolean; onLoaded: () => void }) {
  let isAdmin!: Accessor<boolean>
  const clerk = useClerk()
  const state = { x: 0 }
  const [player, setPlayer] = createStore({
    ref: null as unknown as HTMLElement,
    hat: 'baseball' as Hat,
    size: 300,
    sceneOffsetY: 0,
    get isAdmin() {
      return isAdmin()
    },
    get rect() {
      return this.ref.getBoundingClientRect()
    },
    setRef(el: HTMLElement) {
      setPlayer('ref', el)
    },
  })

  isAdmin = createMemo(() => !!clerk()?.user?.publicMetadata?.isAdmin)

  const { data: myInitialPosition } = useQuery(api.gameState.findMyPosition, {}, () => ({
    enabled: props.loaded === false,
  }))

  createEffect(() => {
    /* If the data is already loaded then ignore */
    if (props.loaded) return

    const pos = myInitialPosition()

    /* If the initial position is undefined – it hasn't been fetched yet  */
    if (pos === undefined) return

    batch(() => {
      state.x = pos.x
      setPlayer('sceneOffsetY', pos.y)
      props.onLoaded()
    })
  })

  createEffect(() => {
    if (player.isAdmin) setPlayer('hat', 'admin' as Hat)
  })

  return mergeProps(player, { mutableState: state })
}
