import { makePersisted } from '@solid-primitives/storage'
import { createSignal } from 'solid-js'
import { getLSKey } from '../utils'

export type IntervalsState = ReturnType<typeof createIntervalsState>

export function createIntervalsState() {
  const [samplingInterval, setSamplingInterval] = makePersisted(createSignal(10), { name: getLSKey('sampling') })
  const [batchInterval, setBatchInterval] = makePersisted(createSignal(100), { name: getLSKey('batching') })
  return { samplingInterval, setSamplingInterval, batchInterval, setBatchInterval }
}
