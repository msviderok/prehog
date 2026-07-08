import { useGlobalState } from '@/components/global-state/GlobalStateContext'
import { createGameLoop } from '@/lib/createGameLoop'
import { getPlayerRealPosition } from '@/components/global-state/createAsyncPlayerState'
import { clamp, collisionDetected } from '@/lib/utils'
import { createEffect, onMount } from 'solid-js'
import { MainScene } from './MainScene'
import { Player } from './Player'

const MOVEMENT_SPEED = 0.15
const DT_MOD = 10

export function GameContent() {
  const { player, keyboard, scene, misc } = useGlobalState()

  let eventBatch: any[] = []
  let batchingStartTime = 0
  let samplingStartTime = 0
  let lastTimestamp = performance.now()
  let dt = 0
  let speed = 0

  let moveDirection: 1 | -1 = 1
  createEffect(() => {
    moveDirection = keyboard.keyPressed.d ? 1 : -1
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
      speed = moveDirection * MOVEMENT_SPEED * dt * (keyboard.keyPressed.shift ? 2 : 1)
      /** ––– CAMERA VIEWPORT ––– */

      /**
       * Scrollable width of the screen to allow free player movement at the first 50%
       * of the viewport width at the start and end of the scene
       */
      const sceneRealWidth = scene.state.realSceneSize.width - window.innerWidth
      const playerRealX = getPlayerRealPosition(player.position, scene.state).x
      // Viewport "camera" position
      const cameraOffsetX = clamp(playerRealX > s50 ? playerRealX - s50 : 0, 0, Math.max(0, sceneRealWidth))
      const lastHalfScreenOffset = cameraOffsetX >= sceneRealWidth

      scene.state.ref.style.height = `${scene.state.realSceneSize.height}px`
      scene.state.ref.style.width = `${scene.state.realSceneSize.width}px`
      scene.state.ref.style.transform = `translateX(${-cameraOffsetX}px)`

      /** ––– PLAYER POSITION ––– */
      const playerTop = Math.floor(scene.state.worldUnit.y * player.position.y)
      const playerLeft = clamp(
        Math.floor(playerRealX - player.rect.width / 2 + (lastHalfScreenOffset ? -cameraOffsetX : 0)),
        Math.floor(0 + player.rect.width / 2),
        Math.floor(window.innerWidth * (lastHalfScreenOffset ? 1 : 0.5) - player.rect.width / 2),
      )

      player.ref.style.setProperty('--tx', `${playerLeft}px`)
      player.ref.style.setProperty('--ty', `${playerTop}px`)

      for (const node of scene.state.nodes) {
        scene.setState('nodes', node.idx, 'open', collisionDetected(player.rect, node.realHitbox))
      }

      // Keyboard input
      if (keyboard.keyPressed.d || keyboard.keyPressed.a) {
        // Push to the batch at the sampling interval
        if (timestamp - samplingStartTime >= misc.samplingInterval()) {
          const newX =
            player.position.x +
            ((player.rect.left <= 0 && moveDirection === -1) ||
            (player.rect.right >= window.innerWidth && moveDirection === 1)
              ? 0
              : speed)
          const fixedY = clamp(player.position.y, 0, 100)
          const fixedX = clamp(newX, 0, 100)
          const event = {
            type: 'move',
            y: fixedY,
            x: fixedX,
            timeSinceBatchStart: timestamp - samplingStartTime,
          }
          player.setPosition({ x: fixedX, y: fixedY })
          eventBatch.push(event)
          samplingStartTime = timestamp
        }

        // Send batch
        if (timestamp - batchingStartTime >= misc.batchInterval()) {
          batchingStartTime = timestamp

          if (eventBatch.length === 0) return
          // void updateMe.mutate({ actions: eventBatch, x: me.x, y: me.y })
          eventBatch = []
        }

        return
      }
    },
  })

  return (
    <div class="w-min h-min relative">
      <MainScene />
      <Player />
    </div>
  )
}
