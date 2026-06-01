import { makePersisted } from '@solid-primitives/storage'
import { createSignal } from 'solid-js'
import { getLSKey } from '../utils'

export type MiscState = ReturnType<typeof createMiscState>

export function createMiscState() {
  const [debug, setDebug] = makePersisted(createSignal(false), { name: getLSKey('debug') })
  return { debug, setDebug }
}
