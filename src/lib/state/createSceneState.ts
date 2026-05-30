import { createStore } from 'solid-js/store'
import { createRectFromCoords } from '../utils'
import { createEffect, onCleanup, onMount } from 'solid-js'
import type { PopoverContentPositionerProps } from '@/components/ui/popover'

export type SceneState = ReturnType<typeof createSceneState>
export type SceneNode = SceneState['sceneState']['nodes'][number]

export function createSceneState() {
  const [sceneState, setSceneState] = createStore({
    ref: null as unknown as HTMLElement,
    originalWidth: 0,
    originalHeight: 0,
    scale: 1,
    nodes: SCENE_NODES.map((node, idx) =>
      Object.assign(
        {
          idx,
          open: false,
          ref: null as unknown as HTMLElement,
          get realHitbox() {
            return this.ref.getBoundingClientRect()
          },
        },
        node,
      ),
    ),
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

  function onCreateNode(e: MouseEvent) {
    const target = e.target as HTMLElement
    if (target.dataset.node) {
      // navigator.clipboard.writeText(JSON.stringify(sceneState.nodes))
      return
    }
    // const x = clamp((e.clientX - sceneState.rect.left) / sceneState.realSceneSize.width, 0, 1)
    // const y = clamp((e.clientY - sceneState.rect.top) / sceneState.realSceneSize.height, 0, 1)
    // setSceneState('nodes', sceneState.nodes.length, { x, y })
  }

  createEffect(() => {
    const root = document.documentElement
    root?.style.setProperty('--scale', `${sceneState.scale}`)
  })

  function onWindowResize() {
    setSceneState('scale', Math.min(window.innerHeight / sceneState.originalHeight, 1))
  }

  onMount(() => {
    queueMicrotask(onWindowResize)
    window.addEventListener('resize', onWindowResize)
    document.addEventListener('click', onCreateNode)
  })

  onCleanup(() => {
    window.removeEventListener('resize', onWindowResize)
    document.removeEventListener('click', onCreateNode)
  })

  return { sceneState, setSceneState }
}

const SCENE_NODES = [
  {
    x: 0.2099,
    y: 0.485,
    type: 'popover' as const,
    positioner: { side: 'top', align: 'start' } as PopoverContentPositionerProps,
    text: 'yo, dawg',
    hitbox: createRectFromCoords({ x1: 0.15, y1: 0.75, x2: 0.25, y2: 1 }),
  },
  {
    x: 0.2258,
    y: 0.701,
    type: 'popover' as const,
    positioner: { side: 'left', align: 'end' } as PopoverContentPositionerProps,
    text: 'oi, mate',
    hitbox: createRectFromCoords({ x1: 0.2, y1: 0.75, x2: 0.28, y2: 1 }),
  },
  {
    x: 0.5064,
    y: 0.7039,
    type: 'popover' as const,
    positioner: { side: 'right', align: 'center' } as PopoverContentPositionerProps,
    text: 'wazzup, fam',
    hitbox: createRectFromCoords({ x1: 0.44, y1: 0.75, x2: 0.53, y2: 1 }),
  },
  {
    x: 0.5234,
    y: 0.4549,
    type: 'popover' as const,
    positioner: { side: 'top', align: 'end' } as PopoverContentPositionerProps,
    text: 'sup, bro',
    hitbox: createRectFromCoords({ x1: 0.48, y1: 0.75, x2: 0.58, y2: 1 }),
  },
  {
    x: 0.8264,
    y: 0.4212,
    type: 'popover' as const,
    positioner: { side: 'top', align: 'start' } as PopoverContentPositionerProps,
    text: "what's up, man",
    hitbox: createRectFromCoords({ x1: 0.76, y1: 0.75, x2: 0.86, y2: 1 }),
  },
  {
    x: 0.8431,
    y: 0.5858,
    type: 'popover' as const,
    positioner: { side: 'left', align: 'start' } as PopoverContentPositionerProps,
    text: 'hey, yo',
    hitbox: createRectFromCoords({ x1: 0.82, y1: 0.75, x2: 0.88, y2: 1 }),
  },
  {
    x: 0.9247,
    y: 0.6463,
    type: 'popover' as const,
    positioner: { side: 'bottom', align: 'end' } as PopoverContentPositionerProps,
    text: 'wassup, homie',
    hitbox: createRectFromCoords({ x1: 0.9, y1: 0.75, x2: 1, y2: 1 }),
  },
]
