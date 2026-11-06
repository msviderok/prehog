import { createEffect, on, onCleanup, onMount, type Accessor } from 'solid-js'
import { BATCHING_INTERVAL_MS, SAMPLING_INTERVAL_MS } from './constants'
import { defaultProps } from './utils'

const TICK_MS = 16.66666666 // 60 fps;
const DEBUG_TICK_INTERVAL_MS = 1000
const OFFLINE_POSITION_UPDATE_INTERVAL_MS = 3000

export function createRAFLoop(
  enabled: Accessor<boolean>,
  options: {
    autostart?: boolean
    fn: (
      timestamp: number,
      dt: number,
      samplingTick: boolean,
      batchingTick: boolean,
      msSinceBatchStart: number,
      debugTick: boolean,
      offlinePositionUpdateTick: boolean,
    ) => void
  },
) {
  const props = defaultProps(options, { autostart: true })

  let isLoopInProgress = false
  let mainGameLoop: number | undefined
  let tickTimer = 0
  let lastTimestamp = performance.now()
  let batchingStartTime = 0
  let samplingStartTime = 0
  let debugTickStartTime = 0
  let offlinePositionUpdateTime = 0

  function runProcessingForSingleTick(timestamp: number) {
    const dt = (timestamp - lastTimestamp) / 1000
    lastTimestamp = timestamp
    const msSinceBatchStart = timestamp - batchingStartTime
    const batchingTick = msSinceBatchStart >= BATCHING_INTERVAL_MS
    const samplingTick = timestamp - samplingStartTime >= SAMPLING_INTERVAL_MS
    const debugTick = timestamp - debugTickStartTime >= DEBUG_TICK_INTERVAL_MS
    const offlinePositionUpdateTick = timestamp - offlinePositionUpdateTime >= OFFLINE_POSITION_UPDATE_INTERVAL_MS
    props.fn(timestamp, dt, samplingTick, batchingTick, msSinceBatchStart, debugTick, offlinePositionUpdateTick)
    if (samplingTick) samplingStartTime = timestamp
    if (batchingTick) batchingStartTime = timestamp
    if (debugTick) debugTickStartTime = timestamp
    if (offlinePositionUpdateTick) offlinePositionUpdateTime = timestamp
  }

  function gameLoop(timestamp: number) {
    if (!tickTimer) tickTimer = timestamp
    if (timestamp - tickTimer < TICK_MS) {
      mainGameLoop = requestAnimationFrame(gameLoop)
      return
    }

    runProcessingForSingleTick(timestamp)
    tickTimer += TICK_MS
    mainGameLoop = requestAnimationFrame(gameLoop)
  }

  function startLoop() {
    if (mainGameLoop) cancelAnimationFrame(mainGameLoop)
    mainGameLoop = requestAnimationFrame(gameLoop)
    isLoopInProgress = true
  }

  function stopLoop() {
    if (mainGameLoop) cancelAnimationFrame(mainGameLoop)
    mainGameLoop = undefined
    isLoopInProgress = false
  }

  createEffect(on(enabled, (isEnabled) => (isEnabled ? startLoop() : stopLoop())))

  onCleanup(() => stopLoop())
  onMount(() => {
    if (props.autostart === false) {
      runProcessingForSingleTick(lastTimestamp)
      return
    }

    if (isLoopInProgress === false) startLoop()
  })
}
