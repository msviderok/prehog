import { SOUNDS } from '@/audio'
import { KeycapButton } from '@/components/ui/button'
import { api } from '@/convex/api'
import { useSingleFlightMutation } from '@/lib/useSingleFlightMutation'
import { createPolygonClipPath, isMarkerAction, random } from '@/lib/utils'
import type { Hotkey } from '@tanstack/solid-hotkeys'
import { cn } from 'cn'
import { createEffect, createMemo, createSignal, Index, on, type JSX, type ParentProps } from 'solid-js'
import { useGlobalState } from '../GlobalStateContext'
import { useSceneContext } from '../Scene.context'
import { useInteractiveNode } from './context'

const POLYGON_SIDES = 14
const POLYGON_ARR = Array.from({ length: POLYGON_SIDES }, (_, i) => i)
const POLYGON_BOTTOM_PLANE_CLIP_PATH = createPolygonClipPath(POLYGON_SIDES)

export function Root(props: ParentProps<{ x: number; y: number }>) {
  const { id, node } = useInteractiveNode<'popover'>()
  const { gameState } = useGlobalState()
  const sceneName = useSceneContext()
  const [size, setSize] = createSignal<Size>({ width: 0, height: 0 })
  const [hitbox, setHitbox] = createSignal<Hitbox>({ x1: 0, x2: 0, y1: 0, y2: 0 })

  node.data.marker = { x: props.x, y: props.y, reactive: { size, setSize, hitbox, setHitbox } }
  node.hitbox.x1 = node.data.marker.x - gameState.scene(sceneName).static.eventMarkerRadius
  node.hitbox.x2 = node.data.marker.x + gameState.scene(sceneName).static.eventMarkerRadius
  node.hitbox.y1 = node.data.marker.y - gameState.scene(sceneName).static.eventMarkerHeight
  node.hitbox.y2 = node.data.marker.y + gameState.scene(sceneName).static.eventMarkerHeight
  node.size.width = node.hitbox.x2 - node.hitbox.x1
  node.size.height = node.hitbox.y2 - node.hitbox.y1
  node.data.marker.reactive.setSize(node.size)
  node.data.marker.reactive.setHitbox(node.hitbox)

  gameState.scene(sceneName).nodes.registerSlot(id, 'marker', () => <EventMarker {...props} />)
  return null
}

function EventMarker(props: ParentProps<{ x: number; y: number }>) {
  const { interaction } = useGlobalState()
  const { id, node } = useInteractiveNode<'popover'>()
  const delay = random(1, 10)

  createEffect(
    on(
      () => node.collided(),
      (isOpen, prevIsOpen) => {
        if (prevIsOpen == null) return
        SOUNDS.effects[isOpen ? 'markerEnter' : 'markerLeave'].play()
      },
    ),
  )

  const action = createMemo(() => {
    const data = interaction.data()
    if (isMarkerAction(data) === false) return
    return node.collided() && data.nodeId === id ? data : undefined
  })

  return (
    <div
      class="marker"
      data-delay={delay}
      data-collided={+node.collided()}
      data-node-tx={node.data.marker.reactive.hitbox().x1}
      data-node-ty={node.data.marker.reactive.hitbox().y1}
      data-node-width={node.data.marker.reactive.size().width}
      data-node-height={node.data.marker.reactive.size().height}
    >
      <div
        class={cn('marker-polygons', action()?.type === 'marker-enter' && 'marker-enter-anchor')}
        data-len={POLYGON_SIDES}
        data-bottom-clip-path={POLYGON_BOTTOM_PLANE_CLIP_PATH}
      >
        <Index each={POLYGON_ARR}>{(_, idx) => <span style={{ '--i': `${idx}` }} />}</Index>
      </div>
      {props.children}
    </div>
  )
}

export function Pill(
  props: {
    /** @default "Interact" */
    label?: JSX.Element
    /** @default "x" of the marker */
    offsetX?: number
    /** @default "y" of the marker - (player height * 1.3 WUy) */
    offsetY?: number
    /** @default "E" */
    hotkey?: Hotkey
  } & (
    | {
        onInteract: (node: InteractiveNode) => void
        goTo?: never
      }
    | {
        onInteract?: never
        goTo?: CurrentScene
      }
  ),
) {
  const { node } = useInteractiveNode()
  const { player, interaction, gameState } = useGlobalState()
  const sceneName = useSceneContext()
  const setScene = useSingleFlightMutation(api.gameState.setScene)
  const y = createMemo(
    () =>
      (props.offsetY ?? gameState.scene(sceneName).static.playerHeight * 1.3 * -1) *
      gameState.scene(sceneName).static.worldUnitY,
  )
  const x = createMemo(() => (props.offsetX ?? 0) * gameState.scene(sceneName).static.worldUnitX)

  const disabled = createMemo(() => interaction.isActive() || node.collided() !== true)

  return (
    <div
      class={cn('marker-floating-action', disabled() && 'quick-hide')}
      style={{ '--ty': `${y()}px`, '--tx': `${x()}px` }}
    >
      <div class="animate-pulseY">
        <div class="bg-shade-ph-dark-cornflower-blue/60 border-6 rounded-full flex items-center justify-center gap-3 h-18 px-5 border-glow-ph-light-cornflower-blue w-max">
          <KeycapButton
            disabled={disabled()}
            hotkey={props.hotkey ?? 'E'}
            class="w-auto"
            onPress={() => {
              if (props.onInteract) return props.onInteract(node)
              if (props.goTo) return void setScene.mutate({ scene: props.goTo, x: player.x })
              throw new Error('Unhandled event interaction')
            }}
          />
          <span class="comic text-xl">{props.label ?? 'Interact'}</span>
        </div>
      </div>
    </div>
  )
}
