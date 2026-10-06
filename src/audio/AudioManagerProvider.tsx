import { api } from '@/convex/api'
import { useStableQuery } from '@/lib/useStableQuery'
import { createEffect, createSignal, on, onCleanup, type ParentProps } from 'solid-js'
import { SOUNDS } from '.'
import { AudioManagerContext } from './context'

export function AudioManagerProvider(props: ParentProps) {
  const [volume, setVolume] = createSignal(1)
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

  const bgMusicSound = SOUNDS.music.oblivion_npc_piano
  const [bgMusic, setBgMusic] = createSignal(false)
  createEffect(
    on(bgMusic, (isPlaying) => {
      if (isPlaying && !bgMusicSound.playing()) bgMusicSound.play()
      else bgMusicSound.stop()
    }),
  )

  onCleanup(() => {
    if (bgMusicSound.playing()) bgMusicSound.stop()
  })

  return (
    <AudioManagerContext.Provider
      value={{
        volume,
        setVolume,
        bgMusic,
        setBgMusic,
      }}
    >
      {props.children}
    </AudioManagerContext.Provider>
  )
}
