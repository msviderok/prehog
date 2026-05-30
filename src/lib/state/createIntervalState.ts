import { makePersisted } from '@solid-primitives/storage'
import { createSignal } from 'solid-js'

export type IntervalsState = ReturnType<typeof createIntervalsState>

export function createIntervalsState() {
  const [samplingInterval, setSamplingInterval] = makePersisted(createSignal(10), { name: 'sampling' })
  const [batchInterval, setBatchInterval] = makePersisted(createSignal(100), { name: 'batching' })
  return { samplingInterval, setSamplingInterval, batchInterval, setBatchInterval }
}
