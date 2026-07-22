import { onCleanup, onMount } from 'solid-js'
import { defaultProps } from './utils'
import { BATCHING_INTERVAL_MS, SAMPLING_INTERVAL_MS } from './constants'

const TICK_MS = 16.66666666 // 60 fps;
const DT_MOD = 10

export function createRAFLoop(options: {
  autostart?: boolean
  fn: (timestamp: number, dt: number, samplingTick: boolean, batchingTick: boolean, msSinceBatchStart: number) => void
}) {
  const props = defaultProps(options, { autostart: true })

  let mainGameLoop: number | undefined
  let tickTimer = 0
  let lastTimestamp = performance.now()
  let batchingStartTime = 0
  let samplingStartTime = 0

  function runProcessingForSingleTick(timestamp: number) {
    const dt = (timestamp - lastTimestamp) / DT_MOD
    lastTimestamp = timestamp
    const msSinceBatchStart = timestamp - batchingStartTime
    const batchingTick = msSinceBatchStart >= BATCHING_INTERVAL_MS
    const samplingTick = timestamp - samplingStartTime >= SAMPLING_INTERVAL_MS
    props.fn(timestamp, dt, samplingTick, batchingTick, msSinceBatchStart)
    if (samplingTick) samplingStartTime = timestamp
    if (batchingTick) batchingStartTime = timestamp
  }

  function gameLoop(timestamp: number) {
    if (!tickTimer) tickTimer = timestamp
    if (timestamp - tickTimer < TICK_MS) return requestAnimationFrame(gameLoop)

    runProcessingForSingleTick(timestamp)
    tickTimer += TICK_MS
    mainGameLoop = requestAnimationFrame(gameLoop)
  }

  onMount(() => {
    if (props.autostart === false) {
      runProcessingForSingleTick(lastTimestamp)
      return
    }

    mainGameLoop = requestAnimationFrame(gameLoop)
  })

  onCleanup(() => {
    if (mainGameLoop) {
      cancelAnimationFrame(mainGameLoop)
    }
  })
}
