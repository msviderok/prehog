import {
  createContext,
  createEffect,
  createSignal,
  onMount,
  useContext,
  type Accessor,
  type ParentProps,
  type Setter,
} from 'solid-js'
import { createStore, type SetStoreFunction, type Store } from 'solid-js/store'

const LSK_SAMPLING = 'sampling'
const LSK_BATCHING = 'batching'

interface KeyPressed {
  w: boolean
  a: boolean
  s: boolean
  d: boolean
}

const GlobalStateContext = createContext<{
  keyPressed: Store<KeyPressed>
  setKeyPressed: SetStoreFunction<KeyPressed>
  samplingInterval: Accessor<number>
  setSamplingInterval: Setter<number>
  batchInterval: Accessor<number>
  setBatchInterval: Setter<number>
  me: {
    x: Accessor<number>
    y: Accessor<number>
  }
}>()

export function GlobalStateProvider(props: ParentProps) {
  const [keyPressed, setKeyPressed] = createStore({ w: false, s: false, a: false, d: false })
  const [samplingInterval, setSamplingInterval] = createSignal(10)
  const [batchInterval, setBatchInterval] = createSignal(100)

  createEffect(() => localStorage.setItem(LSK_SAMPLING, `${samplingInterval()}`))
  createEffect(() => localStorage.setItem(LSK_SAMPLING, `${batchInterval()}`))

  onMount(() => {
    const initSampling = localStorage.getItem(LSK_SAMPLING)
    const initBatching = localStorage.getItem(LSK_BATCHING)
    if (initSampling) setSamplingInterval(+initSampling)
    if (initBatching) setBatchInterval(+initBatching)
  })

  return (
    <GlobalStateContext.Provider
      value={{ keyPressed, setKeyPressed, samplingInterval, setSamplingInterval, batchInterval, setBatchInterval }}
    >
      {props.children}
    </GlobalStateContext.Provider>
  )
}

export function useGlobalState() {
  const context = useContext(GlobalStateContext)
  if (!context) throw new Error('useGlobalState must be used inside GlobalStateProvider')
  return context
}
