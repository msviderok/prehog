import type { api } from '@/convex/api'
import {
  COMMON_SCENE_HEIGHT,
  EVENT_MARKER_SIZE,
  GAME_CONTENT_HEIGHT_RATIO,
  PLAYER_HITBOX_SIZE,
  PLAYER_JUMP_ANIMATION_MS,
  PLAYER_JUMP_ANIMATION_MS_PER_FRAME,
  PLAYER_JUMP_END_ANIMATION_MS,
  PLAYER_JUMP_START_ANIMATION_MS,
  PLAYER_SIZE,
  SCENE,
} from '@/lib/constants'
import { useNavigate } from '@tanstack/solid-router'
import type { FunctionReturnType } from 'convex/server'
import {
  type Accessor,
  batch,
  createEffect,
  createMemo,
  createSignal,
  on,
  onCleanup,
  onMount,
  type Setter,
} from 'solid-js'
import { createStore, type SetStoreFunction, type Store } from 'solid-js/store'

declare global {
  type SceneCache = _SceneCache
}

interface _SceneCache {
  nodes: {
    list: Map<string, InteractiveNode>
    views: Map<InteractiveNode['type'], Map<string, InteractiveNode>>
    slots: Store<Record<string, NodeSlots>>
    setSlots: SetStoreFunction<Record<string, NodeSlots>>
    registerSlot<K extends keyof NodeSlots>(interactiveNodeId: string, slot: K, component: NodeSlots[K]): void
    register<T extends InteractiveNode>(id: string, node: T): void
    get<
      K extends InteractiveNode['type'] | undefined = undefined,
      R = K extends string ? InteractiveNodeOf<K> : InteractiveNode,
    >(
      id: string,
    ): R
    byType<K extends InteractiveNode['type'], R = Map<string, InteractiveNodeOf<K>>>(type: K): R
  }
  static: {
    originalSceneWidth: number
    originalSceneHeight: number
    initialPositionOnSceneX: number
    initialPositionOnSceneY: number
    /** PX value for 1 world width unit */
    worldUnitX: number
    /** PX value for 1 world height unit */
    worldUnitY: number
    /** Min world unit X of the scene the player should be able to move to */
    walkableMinX: number
    /** Max world unit X of the scene the player should be able to move to */
    walkableMaxX: number
    playerWidth: number
    playerHeight: number
    playerHalfWidth: number
    playerHalfHeight: number
    playerHitboxY1: number
    playerHitboxY2: number
    eventMarkerRadius: number
    eventMarkerHeight: number
  }
  scaled: {
    /**
     * Scale of the scene calculated by the formula:
     * Math.min(gameContentHeight / COMMON_SCENE_HEIGHT, 1)
     */
    scale: number
    width: number
    height: number
    /** 50% of the current viewport width in PX */
    s50PX: number
    /** 50% of the current viewport width in world units */
    s50WU: number
    cameraStartTravelAtX: number
    cameraEndTravelAtX: number
  }
}

function defineEnumNames<T extends PropertyKey>() {
  return <const Names extends readonly T[]>(
    enumValues: Exclude<T, Names[number]> extends never ? Names : never,
  ): Names => enumValues
}

const SCENE_NAMES = defineEnumNames<CurrentScene>()(['main', 'tour', 'application', 'pet', 'personal'])
const NODE_VIEW_NAMES = defineEnumNames<InteractiveNode['type']>()(['player', 'popover'])

export class GameState {
  public sceneCache = new Map<CurrentScene, SceneCache>()
  public currentScene: Accessor<CurrentScene>

  #currentSceneCacheAccessor: Accessor<SceneCache>
  #setCurrentScene: Setter<CurrentScene>
  #nextScene: Accessor<CurrentScene | null>
  #setNextScene: Setter<CurrentScene | null>

  #player: GlobalState['player']
  #lastKnownXPosition = new Map<CurrentScene, number | undefined>()

  constructor(props: {
    player: GlobalState['player']
    currentScene: Accessor<FunctionReturnType<typeof api.gameState.currentScene>>
    lastKnownXPositions: Accessor<FunctionReturnType<typeof api.gameState.getLastKnownXPositions>>
  }) {
    for (const scene of SCENE_NAMES) {
      const sceneStatic = createSceneStatic(scene)
      const [slots, setSlots] = createStore<Record<string, NodeSlots>>({})
      this.sceneCache.set(scene, {
        static: sceneStatic,
        scaled: createSceneScaled(sceneStatic),
        nodes: {
          list: new Map(),
          views: new Map(NODE_VIEW_NAMES.map((view) => [view, new Map()])),
          slots,
          setSlots,
          get<
            K extends InteractiveNode['type'] | undefined = undefined,
            R = K extends string ? InteractiveNodeOf<K> : InteractiveNode,
          >(id: string): R {
            return this.list.get(id) as R
          },
          register<T extends InteractiveNode>(id: string, node: T) {
            this.list.set(id, node)
            setSlots(id, {})
            const view = this.views.get(node.type) ?? new Map()
            view.set(id, node)
          },
          registerSlot<K extends keyof NodeSlots>(interactiveNodeId: string, slot: K, component: NodeSlots[K]) {
            setSlots(interactiveNodeId, slot, () => component)
          },
          byType<K extends InteractiveNode['type'], R = Map<string, InteractiveNodeOf<K>>>(type: K): R {
            return this.views.get(type) as R
          },
        },
      })
    }

    this.#player = props.player

    const initialScene = props.currentScene().scene
    const [__currentScene, __setCurrentScene] = createSignal(initialScene)
    this.currentScene = __currentScene
    this.#setCurrentScene = __setCurrentScene
    this.#currentSceneCacheAccessor = createMemo(() => {
      const scene = this.currentScene()
      const cache = this.sceneCache.get(scene)
      if (!cache) throw new Error(`No cache for scene "${scene}".`)
      return cache
    })

    const [__nextScene, __setNextScene] = createSignal<CurrentScene | null>(null)
    this.#nextScene = __nextScene
    this.#setNextScene = __setNextScene

    const navigate = useNavigate()
    createEffect(
      on(
        () => props.currentScene().scene,
        async (newScene) => {
          this.#setNextScene(newScene)
          const transition = document.startViewTransition({
            types: ['slide-bottom'],
            update: async () => await navigate({ to: `/${newScene}` }),
          })

          // this.#player.__gameloop.paused = true

          try {
            await transition.finished
          } catch (e) {
            console.error('VT Error', e)
          } finally {
            batch(() => {
              this.#setCurrentScene(this.#nextScene()!)
              this.#setNextScene(null)
            })
            // this.#player.__gameloop.paused = false
            this.#updateSceneCssVariables()
          }
        },
      ),
    )

    this.#registerSceneChangeCalculator()
    this.#registerWindowResizeListener()
    this.#registerStaticCssVariables()

    this.#updateSceneCssVariables()
  }

  public scene(): SceneCache
  public scene(sceneName: CurrentScene): SceneCache
  public scene(sceneName?: CurrentScene): SceneCache {
    return sceneName ? this.sceneCache.get(sceneName)! : this.#currentSceneCacheAccessor()
  }

  #registerSceneChangeCalculator() {
    createEffect(
      on(
        () => this.currentScene(),
        (newScene) => {
          const cache = this.sceneCache.get(newScene)!
          this.#player.x = this.#lastKnownXPosition.get(newScene) ?? cache.static.initialPositionOnSceneX ?? 0
          this.#player.__gameloop.hitbox.x1 = cache.static.initialPositionOnSceneX
          this.#player.__gameloop.hitbox.x2 = cache.static.initialPositionOnSceneX + cache.static.playerWidth
          this.#player.__gameloop.hitbox.y1 = cache.static.playerHitboxY1
          this.#player.__gameloop.hitbox.y2 = cache.static.playerHitboxY2
        },
      ),
    )
  }

  #registerWindowResizeListener() {
    const onResize = () => {
      for (const scene of SCENE_NAMES) {
        const cache = this.sceneCache.get(scene)!
        cache.scaled = createSceneScaled(cache.static)
        this.#updateSceneCssVariables()
      }
    }
    onMount(() => {
      window.addEventListener('resize', onResize)
      onCleanup(() => {
        window.removeEventListener('resize', onResize)
      })
    })
  }

  #registerStaticCssVariables() {
    onMount(() => {
      const root = document.documentElement
      root.style.setProperty('--game-content-height-ratio', `${GAME_CONTENT_HEIGHT_RATIO}`)
      root.style.setProperty('--player-jump-animation-ms', `${PLAYER_JUMP_ANIMATION_MS}ms`)
      root.style.setProperty('--player-jump-start-animation-ms', `${PLAYER_JUMP_START_ANIMATION_MS}ms`)
      root.style.setProperty('--player-jump-end-animation-ms', `${PLAYER_JUMP_END_ANIMATION_MS}ms`)
      root.style.setProperty('--player-jump-animation-ms-per-frame', `${PLAYER_JUMP_ANIMATION_MS_PER_FRAME}ms`)
      root.style.setProperty('--original-player-width', `${PLAYER_SIZE.width}px`)
      root.style.setProperty('--original-player-height', `${PLAYER_SIZE.height}px`)
      root.style.setProperty('--original-player-hitbox-width', `${PLAYER_HITBOX_SIZE.width}px`)
      root.style.setProperty('--original-player-hitbox-height', `${PLAYER_HITBOX_SIZE.height}px`)
    })
  }

  public updateScene() {
    this.#updateSceneCssVariables()
  }

  #updateSceneCssVariables() {
    const root = document.documentElement
    root.style.setProperty('--player-offset-y', `${this.#currentSceneCacheAccessor().static.initialPositionOnSceneY}`)
    root.style.setProperty('--original-scene-width', `${this.#currentSceneCacheAccessor().static.originalSceneWidth}px`)
    root.style.setProperty(
      '--original-scene-height',
      `${this.#currentSceneCacheAccessor().static.originalSceneHeight}px`,
    )
    root.style.setProperty('--wux', `${this.#currentSceneCacheAccessor().static.worldUnitX}px`)
    root.style.setProperty('--wuy', `${this.#currentSceneCacheAccessor().static.worldUnitY}px`)
    root.style.setProperty('--scale', `${this.#currentSceneCacheAccessor().scaled.scale}`)
    root.style.setProperty('--real-scene-width', `${this.#currentSceneCacheAccessor().scaled.width}px`)
    root.style.setProperty('--real-scene-height', `${this.#currentSceneCacheAccessor().scaled.height}px`)
  }
}

function createSceneStatic(scene: CurrentScene): SceneCache['static'] {
  const initial = SCENE[scene]
  const playerWidth = (PLAYER_HITBOX_SIZE.width / initial.width) * 100
  const playerHeight = (PLAYER_HITBOX_SIZE.height / initial.height) * 100
  const playerHalfWidth = playerWidth / 2
  const playerHalfHeight = playerHeight / 2
  const worldUnitX = initial.width / 100
  const worldUnitY = initial.height / 100
  return {
    playerWidth,
    playerHeight,
    playerHalfWidth,
    playerHalfHeight,
    originalSceneWidth: initial.width,
    originalSceneHeight: initial.height,
    initialPositionOnSceneX: initial.playerInitialX,
    initialPositionOnSceneY: initial.playerInitialY,
    worldUnitX,
    worldUnitY,
    walkableMinX: playerHalfWidth,
    walkableMaxX: 100 - playerHalfWidth,
    playerHitboxY1: initial.playerInitialY - playerHalfHeight,
    playerHitboxY2: initial.playerInitialY + playerHalfHeight,
    eventMarkerRadius: EVENT_MARKER_SIZE.width / worldUnitX,
    eventMarkerHeight: EVENT_MARKER_SIZE.height / worldUnitY,
  }
}

function createSceneScaled(staticCache: SceneCache['static']): SceneCache['scaled'] {
  const gameContentHeight = window.innerHeight * GAME_CONTENT_HEIGHT_RATIO
  const scale = Math.min(gameContentHeight / COMMON_SCENE_HEIGHT, 1)
  const scaledWidth = staticCache.originalSceneWidth * scale
  const scaledHeight = staticCache.originalSceneHeight * scale
  const s50PX = Math.min(window.innerWidth, scaledWidth) / 2
  const s50WU = (s50PX / scaledWidth) * 100
  return {
    scale,
    s50PX,
    s50WU,
    width: scaledWidth,
    height: scaledHeight,
    cameraStartTravelAtX: s50WU,
    cameraEndTravelAtX: 100 - s50WU,
  }
}
