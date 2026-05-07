import { useGlobalState } from '@/components/GlobalStateContext'
import { onCleanup, onMount } from 'solid-js'

export function createKeyboardListener() {
  const { setKeyPressed } = useGlobalState()

  function onKeyDown(e: KeyboardEvent) {
    if (e.code === 'KeyW' || e.code === 'ArrowUp') return setKeyPressed('w', true)
    if (e.code === 'KeyS' || e.code === 'ArrowDown') return setKeyPressed('s', true)
    if (e.code === 'KeyA' || e.code === 'ArrowLeft') return setKeyPressed('a', true)
    if (e.code === 'KeyD' || e.code === 'ArrowRight') return setKeyPressed('d', true)
    if (e.key === 'Shift') return setKeyPressed('shift', true)
  }

  function onKeyUp(e: KeyboardEvent) {
    if (e.code === 'KeyW' || e.code === 'ArrowUp') return setKeyPressed('w', false)
    if (e.code === 'KeyS' || e.code === 'ArrowDown') return setKeyPressed('s', false)
    if (e.code === 'KeyA' || e.code === 'ArrowLeft') return setKeyPressed('a', false)
    if (e.code === 'KeyD' || e.code === 'ArrowRight') return setKeyPressed('d', false)
    if (e.key === 'Shift') return setKeyPressed('shift', false)
  }

  onMount(() => {
    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('keyup', onKeyUp)
    onCleanup(() => {
      document.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('keyup', onKeyUp)
    })
  })
}
