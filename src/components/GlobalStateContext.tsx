import { clamp, createRectFromCoords } from '@/lib/utils'
import { useMutation } from 'convex-solidjs'
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
import { api } from '../../convex/_generated/api'

const LSK_SAMPLING = 'sampling'
const LSK_BATCHING = 'batching'
const LSK_ME_POSITION = 'me_position'

const GlobalStateContext = createContext<{
  keyPressed: Store<GlobalState.KeyPressed>
  setKeyPressed: SetStoreFunction<GlobalState.KeyPressed>

  samplingInterval: Accessor<number>
  setSamplingInterval: Setter<number>
  batchInterval: Accessor<number>
  setBatchInterval: Setter<number>

  sceneState: Store<Scene.State>
  setSceneState: SetStoreFunction<Scene.State>
  nodes: Store<Scene.Nodes>
  setNodes: SetStoreFunction<Scene.Nodes>

  player: Store<GlobalState.Player>
  setPlayer: SetStoreFunction<GlobalState.Player>

  floatingPanels: Store<GlobalState.FloatingPanels>
  setFloatingPanels: SetStoreFunction<GlobalState.FloatingPanels>

  rtc: Store<GlobalState.RTC>
  setRtc: SetStoreFunction<GlobalState.RTC>
}>()

export function GlobalStateProvider(props: ParentProps) {
  const setOnline = useMutation(api.users.setOnline)

  const [samplingInterval, setSamplingInterval] = createSignal(10)
  const [batchInterval, setBatchInterval] = createSignal(100)

  const [nodes, setNodes] = createStore<Scene.Nodes>(
    SCENE_NODES.map((node, idx): Scene.Node => {
      ;(node as any).idx = idx
      Object.defineProperty(node, 'realHitbox', {
        configurable: true,
        get() {
          return node.ref.getBoundingClientRect()
        },
      })
      return node as Scene.Node
    }),
  )
  const [sceneState, setSceneState] = createStore<Scene.State>({
    ref: null as any,
    originalWidth: 0,
    originalHeight: 0,
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

  const [keyPressed, setKeyPressed] = createStore<GlobalState.KeyPressed>({
    w: false,
    s: false,
    a: false,
    d: false,
    shift: false,
  })
  const [player, setPlayer] = createStore<GlobalState.Player>({
    ref: null as any,
    x: 0,
    y: 0,
    size: 300,
    get rect() {
      return this.ref.getBoundingClientRect()
    },
    get realPosition() {
      return {
        x: this.x * sceneState.worldUnit.x,
        y: this.y * sceneState.worldUnit.y,
      }
    },
  })

  const [floatingPanels, setFloatingPanels] = createStore<GlobalState.FloatingPanels>({
    containerRef: undefined,
    panels: {},
  })

  const [rtc, setRtc] = createStore<GlobalState.RTC>({
    pc: new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] }),
    ref: null,
    stream: null,
  })

  createEffect(() => localStorage.setItem(LSK_SAMPLING, `${samplingInterval()}`))
  createEffect(() => localStorage.setItem(LSK_BATCHING, `${batchInterval()}`))
  createEffect(() => localStorage.setItem(LSK_ME_POSITION, JSON.stringify({ x: player.x, y: player.y })))
  createEffect(() => {
    const root = document.documentElement
    root?.style.setProperty('--scale', `${sceneState.scale}`)
    player.ref?.style.setProperty('--running-mod', `${keyPressed.shift ? 2.5 : 1}`)
  })

  onMount(() => {
    const initSampling = localStorage.getItem(LSK_SAMPLING)
    const initBatching = localStorage.getItem(LSK_BATCHING)
    if (initSampling) setSamplingInterval(+initSampling)
    if (initBatching) setBatchInterval(+initBatching)

    queueMicrotask(() => {
      setSceneState('scale', Math.min(window.innerHeight / sceneState.originalHeight, 1))
    })

    function onWindowResize() {
      setSceneState('scale', Math.min(window.innerHeight / sceneState.originalHeight, 1))
    }

    function onClick(e: MouseEvent) {
      const target = e.target as HTMLElement
      if (target.dataset.node) {
        // navigator.clipboard.writeText(JSON.stringify(sceneState.nodes))
        return
      }
      const x = clamp((e.clientX - sceneState.rect.left) / sceneState.realSceneSize.width, 0, 1)
      const y = clamp((e.clientY - sceneState.rect.top) / sceneState.realSceneSize.height, 0, 1)
      // setSceneState('nodes', sceneState.nodes.length, { x, y })
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

        samplingInterval,
        setSamplingInterval,
        batchInterval,
        setBatchInterval,

        sceneState,
        setSceneState,
        nodes,
        setNodes,

        player,
        setPlayer,

        floatingPanels,
        setFloatingPanels,

        rtc,
        setRtc,
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

const SCENE_NODES: Omit<Scene.Node, 'idx' | 'realHitbox'>[] = [
  {
    x: 0.2099,
    y: 0.485,
    type: 'popover',
    positioner: { side: 'top', align: 'start' },
    text: 'yo, dawg',
    open: false,
    ref: null as unknown as HTMLElement,
    hitbox: createRectFromCoords({ x1: 0.15, y1: 0.75, x2: 0.25, y2: 1 }),
  },
  {
    x: 0.2258,
    y: 0.701,
    type: 'popover',
    positioner: { side: 'left', align: 'end' },
    text: 'oi, mate',
    open: false,
    ref: null as unknown as HTMLElement,
    hitbox: createRectFromCoords({ x1: 0.2, y1: 0.75, x2: 0.28, y2: 1 }),
  },
  {
    x: 0.5064,
    y: 0.7039,
    type: 'popover',
    positioner: { side: 'right', align: 'center' },
    text: 'wazzup, fam',
    open: false,
    ref: null as unknown as HTMLElement,
    hitbox: createRectFromCoords({ x1: 0.44, y1: 0.75, x2: 0.53, y2: 1 }),
  },
  {
    x: 0.5234,
    y: 0.4549,
    type: 'popover',
    positioner: { side: 'top', align: 'end' },
    text: 'sup, bro',
    open: false,
    ref: null as unknown as HTMLElement,
    hitbox: createRectFromCoords({ x1: 0.48, y1: 0.75, x2: 0.58, y2: 1 }),
  },
  {
    x: 0.8264,
    y: 0.4212,
    type: 'popover',
    positioner: { side: 'top', align: 'start' },
    text: "what's up, man",
    open: false,
    ref: null as unknown as HTMLElement,
    hitbox: createRectFromCoords({ x1: 0.76, y1: 0.75, x2: 0.86, y2: 1 }),
  },
  {
    x: 0.8431,
    y: 0.5858,
    type: 'popover',
    positioner: { side: 'left', align: 'start' },
    text: 'hey, yo',
    open: false,
    ref: null as unknown as HTMLElement,
    hitbox: createRectFromCoords({ x1: 0.82, y1: 0.75, x2: 0.88, y2: 1 }),
  },
  {
    x: 0.9247,
    y: 0.6463,
    type: 'popover',
    positioner: { side: 'bottom', align: 'end' },
    text: 'wassup, homie',
    open: false,
    ref: null as unknown as HTMLElement,
    hitbox: createRectFromCoords({ x1: 0.9, y1: 0.75, x2: 1, y2: 1 }),
  },
]
