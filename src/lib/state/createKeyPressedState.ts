import { onCleanup, onMount } from 'solid-js'
import { createStore } from 'solid-js/store'

export type KeyPressedState = ReturnType<typeof createKeyPressedState>

export function createKeyPressedState() {
  const [keyPressed, setKeyPressed] = createStore<{ w: boolean; s: boolean; a: boolean; d: boolean; shift: boolean }>({
    w: false,
    s: false,
    a: false,
    d: false,
    shift: false,
  })

  function onKeyDown(e: KeyboardEvent) {
    if (isInteractiveElement()) return
    if (e.code === 'KeyW' || e.code === 'ArrowUp') return setKeyPressed('w', true)
    if (e.code === 'KeyS' || e.code === 'ArrowDown') return setKeyPressed('s', true)
    if (e.code === 'KeyA' || e.code === 'ArrowLeft') return setKeyPressed('a', true)
    if (e.code === 'KeyD' || e.code === 'ArrowRight') return setKeyPressed('d', true)
    if (e.key === 'Shift') return setKeyPressed('shift', true)
  }

  function onKeyUp(e: KeyboardEvent) {
    if (isInteractiveElement()) return
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

  return { keyPressed, setKeyPressed }
}

function isInteractiveElement() {
  const slot = (document.activeElement as HTMLElement).dataset.slot ?? ''
  return ['textarea'].includes(slot)
}
