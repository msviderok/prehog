import { makePersisted } from '@solid-primitives/storage'
import { createSignal } from 'solid-js'
import { getLSKey } from '../../lib/utils'

export type MiscState = ReturnType<typeof createMiscState>
export function createMiscState() {
  const [debug, setDebug] = makePersisted(createSignal(false), { name: getLSKey('debug') })
  const [samplingInterval, setSamplingInterval] = makePersisted(createSignal(10), { name: getLSKey('sampling') })
  const [batchInterval, setBatchInterval] = makePersisted(createSignal(100), { name: getLSKey('batching') })
  return { samplingInterval, setSamplingInterval, batchInterval, setBatchInterval, debug, setDebug }
}
