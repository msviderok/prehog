import { api } from '@/convex/api'
import { useStableQuery } from '@/lib/useStableQuery'
import { createEffect, createMemo, createSignal, on, onCleanup, type ParentProps } from 'solid-js'
import { SOUNDS } from '.'
import { AudioManagerContext } from './context'

export function AudioManagerProvider(props: ParentProps) {
  const [volume, setVolume] = createSignal(1)
  const { data: isWalking } = useStableQuery(api.gameState.getMyIsWalking, {}, { initialData: false })
  const { data: currentScene } = useStableQuery(api.gameState.currentScene)
  const soundWalking = createMemo(() => {
    const audio = currentScene()?.scene === 'tour' ? SOUNDS.footsteps.stone : SOUNDS.footsteps.concrete
    return { audio, originalRate: audio.rate() }
  })
  createEffect(on(isWalking, (val) => (val ? soundWalking().audio.play() : soundWalking().audio.pause())))

  const { data: isRunning } = useStableQuery(api.gameState.getMyIsRunning, {}, { initialData: false })
  const soundFire = SOUNDS.effects.fire
  createEffect(
    on(isRunning, (val) => {
      soundWalking().audio.rate(soundWalking().originalRate * (val ? 2 : 1))
      if (val) {
        // soundFire.fade(0, 0.1, 100)
        soundFire.fade(0, 0, 100)
        soundFire.play()
      } else {
        soundFire.fade(0, 0, 100)
        // soundFire.fade(0.1, 0, 100)
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
