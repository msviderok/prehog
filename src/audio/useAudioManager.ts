import { api } from '@/convex/api'
import { useStableQuery } from '@/lib/useStableQuery'
import { createEffect, on, onCleanup, onMount } from 'solid-js'
import { SOUNDS } from '.'

export function useAudioManager() {
  const { data: isWalking } = useStableQuery(api.gameState.getMyIsWalking)
  const soundWalking = SOUNDS.footsteps.concrete
  createEffect(on(isWalking, (val) => (val ? soundWalking.play() : soundWalking.pause())))

  const { data: isRunning } = useStableQuery(api.gameState.getMyIsRunning)
  const soundFire = SOUNDS.effects.fire
  createEffect(
    on(isRunning, (val) => {
      soundWalking.rate(val ? 2 : 1)
      if (val) {
        soundFire.fade(0, 0.1, 100)
        soundFire.play()
      } else {
        soundFire.fade(0.1, 0, 100)
        soundFire.once('fade', () => soundFire.stop())
      }
    }),
  )

  const bgMusic = SOUNDS.music.oblivion_npc_piano
  onMount(() => {
    // if (bgMusic.playing() === false) bgMusic.play()
    onCleanup(() => bgMusic.playing() && bgMusic.stop())
  })
}
