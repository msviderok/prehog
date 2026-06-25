import { onCleanup, onMount } from 'solid-js'
import { defaultProps } from './utils'

const TICK = 16.66666666 // 60 fps;

export function createGameLoop(options: { autostart?: boolean; fn: (timestamp: number) => void }) {
  let mainGameLoop: number | undefined
  let tickTimer = 0
  const props = defaultProps(options, { autostart: true, fn: () => {} })

  if (props.autostart) {
    onMount(() => start())
    onCleanup(() => stop())
  } else {
    onMount(() => {
      requestAnimationFrame(gameLoop)
    })
  }

  function gameLoop(timestamp: number) {
    if (props.autostart === false) {
      props.fn(timestamp)
      return
    }

    if (!tickTimer) tickTimer = timestamp

    const delta = timestamp - tickTimer
    if (delta < TICK) {
      return start()
    }

    tickTimer += TICK
    props.fn(timestamp)
    start()
  }

  function start() {
    mainGameLoop = requestAnimationFrame(gameLoop)
  }

  function stop() {
    if (mainGameLoop) {
      cancelAnimationFrame(mainGameLoop)
      mainGameLoop = undefined
    }
  }

  return { start, stop }
}
