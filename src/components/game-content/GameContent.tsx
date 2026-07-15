import { useGlobalState } from '@/components/global-state/GlobalStateContext'
import { api } from '@/convex/api'
import type { Doc, Id } from '@/convex/dataModel'
import { BATCHING_INTERVAL_MS, INTERPOLATION_DELAY_MS, SAMPLING_INTERVAL_MS } from '@/lib/constants'
import { createGameLoop } from '@/lib/createGameLoop'
import { clamp, collisionDetected, getPlayerRealPosition, lerp } from '@/lib/utils'
import { useMutation, useQuery } from 'convex-solidjs'
import { createEffect, onMount } from 'solid-js'
import { MainScene } from './MainScene'
import { MyPlayer } from './MyPlayer'
import { OtherPlayers } from './OtherPlayers'

const BASE_MOVEMENT_SPEED = 0.2
const DT_MOD = 10

export function GameContent() {
  const { player, keyboard, scene, onlineUsers } = useGlobalState()
  const { data: shouldSendRealTimeMovement } = useQuery(api.gameState.shouldSendRealTimeMovement, {})
  const sendBatch = useMutation(api.gameState.sendMyBatch)

  let eventBatch: Doc<'game_event_batches'>['batch'] = []
  let batchingStartTime = 0
  let samplingStartTime = 0
  let lastTimestamp = performance.now()
  let dt = 0
  let distanceThisFrame = 0
  let velocity = 0

  let moveDirection: 1 | 0 | -1 = 0
  createEffect(() => {
    moveDirection = keyboard.keyPressed.d ? 1 : keyboard.keyPressed.a ? -1 : 0
  })

  let speedMod = 1
  createEffect(() => {
    speedMod = keyboard.keyPressed.shift ? 2 : 1
  })

  let s50 = 0
  onMount(() => {
    s50 = window.innerWidth * 0.5 // 50% of the screen width
  })

  createGameLoop({
    autostart: true,
    fn: (timestamp) => {
      dt = (timestamp - lastTimestamp) / DT_MOD
      lastTimestamp = timestamp
      velocity = moveDirection * BASE_MOVEMENT_SPEED * speedMod
      distanceThisFrame = velocity * dt

      /** CAMERA VIEWPORT */

      /**
       * Scrollable width of the screen to allow free player movement at the first 50%
       * of the viewport width at the start and end of the scene
       */
      const sceneRealWidth = scene.state.realSceneSize.width - window.innerWidth
      const playerRealX = getPlayerRealPosition(player.mutableState.x, scene.state.worldUnit.x)
      // Viewport "camera" position
      const cameraOffsetX = clamp(playerRealX > s50 ? playerRealX - s50 : 0, 0, Math.max(0, sceneRealWidth))
      const lastHalfScreenOffset = cameraOffsetX >= sceneRealWidth

      scene.state.ref.style.height = `${scene.state.realSceneSize.height}px`
      scene.state.ref.style.width = `${scene.state.realSceneSize.width}px`
      scene.state.ref.style.transform = `translateX(${-cameraOffsetX}px)`

      /** PLAYER POSITION */
      const playerLeft = clamp(
        Math.floor(playerRealX - player.rect.width / 2 + (lastHalfScreenOffset ? -cameraOffsetX : 0)),
        Math.floor(0 + player.rect.width / 2),
        Math.floor(window.innerWidth * (lastHalfScreenOffset ? 1 : 0.5) - player.rect.width / 2),
      )

      player.ref.style.setProperty('--tx', `${playerLeft}px`)

      for (const node of scene.state.nodes) {
        scene.setState('nodes', node.idx, 'open', collisionDetected(player.rect, node.realHitbox))
      }

      if (keyboard.keyPressed.d || keyboard.keyPressed.a) {
        const newX =
          player.mutableState.x +
          ((player.rect.left <= 0 && moveDirection === -1) ||
          (player.rect.right >= window.innerWidth && moveDirection === 1)
            ? 0
            : distanceThisFrame)
        player.mutableState.x = clamp(newX, 0, 100)
      }

      /** SAMPLING */
      if (timestamp - samplingStartTime >= SAMPLING_INTERVAL_MS) {
        if (keyboard.keyPressed.d || keyboard.keyPressed.a) {
          eventBatch.push({ type: 'move', x: player.mutableState.x, t: timestamp - batchingStartTime })
        }

        samplingStartTime = timestamp
      }

      /** BATCHING */
      if (timestamp - batchingStartTime >= BATCHING_INTERVAL_MS) {
        if (shouldSendRealTimeMovement() && eventBatch.length > 0) {
          void sendBatch.mutate({ batch: eventBatch })
        }

        eventBatch = []
        batchingStartTime = timestamp
      }

      /** PROCESS OTHER USERS MOVEMENT */
      const renderTime = Date.now() - INTERPOLATION_DELAY_MS
      for (const otherPlayerId of onlineUsers.data.ids) {
        const otherPlayer = onlineUsers.data.users[otherPlayerId as Id<'users'>]!

        if (otherPlayer.batchQueue.length < 2) {
          continue
        }

        while (otherPlayer.batchQueue.length > 2 && otherPlayer.batchQueue[1]!.t <= renderTime) {
          otherPlayer.batchQueue.shift()
        }

        const a = otherPlayer.batchQueue[0]!
        const b = otherPlayer.batchQueue[1]!
        const alpha = Math.max(0, Math.min(1, (renderTime - a.t) / (b.t - a.t)))

        const x = lerp(a.x, b.x, alpha)
        const posX = getPlayerRealPosition(x, scene.state.worldUnit.x)
        otherPlayer.ref.style.setProperty('--tx', `${posX}px`)
      }
    },
  })

  return (
    <div class="w-min h-min relative">
      <MainScene>
        <OtherPlayers />
      </MainScene>
      <MyPlayer />
    </div>
  )
}
