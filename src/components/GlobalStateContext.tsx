import { clamp } from '@/lib/utils'
import {
  createContext,
  createEffect,
  createSignal,
  onCleanup,
  onMount,
  useContext,
  type Accessor,
  type ParentProps,
  type Setter,
} from 'solid-js'
import { createStore, type SetStoreFunction, type Store } from 'solid-js/store'

const LSK_SAMPLING = 'sampling'
const LSK_BATCHING = 'batching'
const LSK_ME_POSITION = 'me_position'

interface KeyPressed {
  w: boolean
  a: boolean
  s: boolean
  d: boolean
  shift: boolean
}

interface CommonSceneSettings {
  x: number
  y: number
  x2: number
  y2: number
}

interface SceneSettings extends CommonSceneSettings {
  ref: HTMLElement
  rect: DOMRect
  scale: number
  originalWidth: number
  originalHeight: number
  worldUnit: {
    x: number
    y: number
  }
  realSceneSize: {
    width: number
    height: number
  }
  nodes: Array<{ x: number; y: number }>
}

interface MeSettings {
  ref: HTMLElement
  rect: DOMRect
  x: number
  y: number
  size: number
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
  const [keyPressed, setKeyPressed] = createStore({
    w: false,
    s: false,
    a: false,
    d: false,
    shift: false,
  })
  const [samplingInterval, setSamplingInterval] = createSignal(10)
  const [batchInterval, setBatchInterval] = createSignal(100)
  const [sceneSettings, setSceneSettings] = createStore<SceneSettings>({
    ref: null as any,
    x: 0,
    y: 0,
    originalWidth: 0,
    originalHeight: 0,
    x2: 0,
    y2: 0,
    nodes: [],
    scale: 1,
    get rect() {
      return this.ref.getBoundingClientRect()
    },
    get worldUnit() {
      return {
        x: this.realSceneSize.width / 100,
        y: this.realSceneSize.height / 100,
      }
    },
    get realSceneSize() {
      return {
        width: this.originalWidth * this.scale,
        height: Math.min(window.innerHeight, this.originalHeight),
      }
    },
  })
  const [me, setMe] = createStore<MeSettings>({
    ref: null as any,
    x: 0,
    y: 0,
    size: 300,
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
  createEffect(() => {
    const root = document.documentElement
    root.style.setProperty('--scale', `${sceneSettings.scale}`)
    me.ref.style.setProperty('--running-mod', `${keyPressed.shift ? 2.5 : 1}`)
  })

  onMount(() => {
    const initSampling = localStorage.getItem(LSK_SAMPLING)
    const initBatching = localStorage.getItem(LSK_BATCHING)
    if (initSampling) setSamplingInterval(+initSampling)
    if (initBatching) setBatchInterval(+initBatching)

    queueMicrotask(() => {
      setSceneSettings('scale', Math.min(window.innerHeight / sceneSettings.originalHeight, 1))
    })

    function onWindowResize() {
      setSceneSettings('scale', Math.min(window.innerHeight / sceneSettings.originalHeight, 1))
    }

    function onClick(e: MouseEvent) {
      const target = e.target as HTMLElement
      if (target.dataset.node) {
        navigator.clipboard.writeText(target.dataset.node)
        return
      }
      const x = clamp((e.clientX - sceneSettings.rect.left) / sceneSettings.realSceneSize.width, 0, 1)
      const y = clamp((e.clientY - sceneSettings.rect.top) / sceneSettings.realSceneSize.height, 0, 1)
      setSceneSettings('nodes', sceneSettings.nodes.length, { x, y })
    }

    window.addEventListener('resize', onWindowResize)
    document.addEventListener('click', onClick)
    onCleanup(() => {
      window.removeEventListener('resize', onWindowResize)
      document.removeEventListener('click', onClick)
    })
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
