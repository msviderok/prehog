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
import { createStore, unwrap, type SetStoreFunction, type Store } from 'solid-js/store'

const LSK_SAMPLING = 'sampling'
const LSK_BATCHING = 'batching'
const LSK_ME_POSITION = 'me_position'

interface KeyPressed {
  w: boolean
  a: boolean
  s: boolean
  d: boolean
}

interface CommonSceneSettings {
  x: number
  y: number
  viewportWidth: number
  viewportHeight: number
  sceneWidth: number
  sceneHeight: number
  x2: number
  y2: number
}

interface SceneSettings extends CommonSceneSettings {
  ref: HTMLElement
  scale: number
  scaledSize: CommonSceneSettings
  worldUnit: {
    x: number
    y: number
  }
  screenUnit: {
    x: number
    y: number
  }
}

interface MeSettings {
  ref: HTMLElement
  rect: DOMRect
  x: number
  y: number
  realPosition: {
    x: number
    y: number
  }
}

const GlobalStateContext = createContext<{
  keyPressed: Store<KeyPressed>
  setKeyPressed: SetStoreFunction<KeyPressed>
  samplingInterval: Accessor<number>
  setSamplingInterval: Setter<number>
  batchInterval: Accessor<number>
  setBatchInterval: Setter<number>
  sceneSettings: Store<SceneSettings>
  setSceneSettings: SetStoreFunction<SceneSettings>
  me: Store<MeSettings>
  setMe: SetStoreFunction<MeSettings>
}>()

export function GlobalStateProvider(props: ParentProps) {
  const [keyPressed, setKeyPressed] = createStore({ w: false, s: false, a: false, d: false })
  const [samplingInterval, setSamplingInterval] = createSignal(10)
  const [batchInterval, setBatchInterval] = createSignal(100)
  const [sceneSettings, setSceneSettings] = createStore<SceneSettings>({
    ref: null as any,
    x: 0,
    y: 0,
    viewportWidth: 0,
    viewportHeight: 0,
    sceneWidth: 0,
    sceneHeight: 0,
    x2: 0,
    y2: 0,
    scale: 1,
    get scaledSize(): CommonSceneSettings {
      return {
        x: sceneSettings.x * sceneSettings.scale,
        y: sceneSettings.y * sceneSettings.scale,
        viewportWidth: sceneSettings.viewportWidth * sceneSettings.scale,
        viewportHeight: sceneSettings.viewportHeight * sceneSettings.scale,
        sceneWidth: sceneSettings.sceneWidth * sceneSettings.scale,
        sceneHeight: sceneSettings.sceneHeight * sceneSettings.scale,
        x2: sceneSettings.x2 * sceneSettings.scale,
        y2: sceneSettings.y2 * sceneSettings.scale,
      }
    },
    get worldUnit() {
      return {
        x: this.scaledSize.sceneWidth / 100,
        y: this.scaledSize.sceneHeight / 100,
      }
    },
    get screenUnit() {
      return {
        x: window.innerWidth / 100,
        y: window.innerHeight / 100,
      }
    },
  })
  const [me, setMe] = createStore<MeSettings>({
    ref: null as any,
    x: 0,
    y: 0,
    get rect() {
      return this.ref.getBoundingClientRect()
    },
    get realPosition() {
      return {
        x: this.x * sceneSettings.worldUnit.x,
        y: this.y * sceneSettings.worldUnit.y,
      }
    },
  })

  createEffect(() => localStorage.setItem(LSK_SAMPLING, `${samplingInterval()}`))
  createEffect(() => localStorage.setItem(LSK_BATCHING, `${batchInterval()}`))
  createEffect(() => localStorage.setItem(LSK_ME_POSITION, JSON.stringify(me)))

  onMount(() => {
    const initSampling = localStorage.getItem(LSK_SAMPLING)
    const initBatching = localStorage.getItem(LSK_BATCHING)
    if (initSampling) setSamplingInterval(+initSampling)
    if (initBatching) setBatchInterval(+initBatching)
  })

  return (
    <GlobalStateContext.Provider
      value={{
        keyPressed,
        setKeyPressed,
        sceneSettings,
        setSceneSettings,
        samplingInterval,
        setSamplingInterval,
        batchInterval,
        setBatchInterval,
        me,
        setMe,
      }}
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
