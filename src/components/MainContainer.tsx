import { useGlobalState } from '@/components/GlobalStateContext'
import { createGameLoop } from '@/lib/createGameLoop'
import { createKeyboardListener } from '@/lib/createKeyboardListener'
import { clamp, collisionDetected } from '@/lib/utils'
import { createEffect, onMount, type ParentProps } from 'solid-js'
import { VideoCall } from './VideoCall'
import { ActionBar } from './ActionBar'

const MOVEMENT_SPEED = 0.15
const DT_MOD = 10

export function MainContainer(props: ParentProps<{}>) {
  createKeyboardListener()
  const { setPlayer, setNodes, player, keyPressed, nodes, sceneState, batchInterval, samplingInterval } =
    useGlobalState()

  let eventBatch: any[] = []
  let batchingStartTime = 0
  let samplingStartTime = 0
  let lastTimestamp = performance.now()
  let dt = 0
  let speed = 0

  let moveDirection: 1 | -1 = 1
  createEffect(() => {
    moveDirection = keyPressed.d ? 1 : -1
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
      speed = moveDirection * MOVEMENT_SPEED * dt * (keyPressed.shift ? 2 : 1)
      /** ––– CAMERA VIEWPORT ––– */

      /**
       * Scrollable width of the screen to allow free player movement at the first 50%
       * of the viewport width at the start and end of the scene
       */
      const sceneRealWidth = sceneState.realSceneSize.width - window.innerWidth
      // Viewport "camera" position
      const cameraOffsetX = clamp(player.realPosition.x > s50 ? player.realPosition.x - s50 : 0, 0, sceneRealWidth)
      const lastHalfScreenOffset = cameraOffsetX >= sceneRealWidth

      sceneState.ref.style.height = `${sceneState.realSceneSize.height}px`
      sceneState.ref.style.width = `${sceneState.realSceneSize.width}px`
      sceneState.ref.style.transform = `translateX(${-cameraOffsetX}px)`

      /** ––– PLAYER POSITION ––– */
      const playerTop = Math.floor(sceneState.worldUnit.y * player.y)
      const playerLeft = clamp(
        Math.floor(player.realPosition.x - player.rect.width / 2 + (lastHalfScreenOffset ? -cameraOffsetX : 0)),
        Math.floor(0 + player.rect.width / 2),
        Math.floor(window.innerWidth * (lastHalfScreenOffset ? 1 : 0.5) - player.rect.width / 2),
      )

      player.ref.style.setProperty('--tx', `${playerLeft}px`)
      player.ref.style.setProperty('--ty', `${playerTop}px`)

      for (const node of nodes) {
        setNodes(node.idx, 'open', collisionDetected(player.rect, node.realHitbox))
      }

      // Keyboard input
      if (keyPressed.d || keyPressed.a) {
        // Push to the batch at the sampling interval
        if (timestamp - samplingStartTime >= samplingInterval()) {
          const newX =
            player.x +
            ((player.rect.left <= 0 && moveDirection === -1) ||
            (player.rect.right >= window.innerWidth && moveDirection === 1)
              ? 0
              : speed)
          const fixedY = clamp(player.y, 0, 100)
          const fixedX = clamp(newX, 0, 100)
          const event = {
            type: 'move',
            y: fixedY,
            x: fixedX,
            timeSinceBatchStart: timestamp - samplingStartTime,
          }
          setPlayer({ x: fixedX, y: fixedY })
          eventBatch.push(event)
          samplingStartTime = timestamp
        }

        // Send batch
        if (timestamp - batchingStartTime >= batchInterval()) {
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
    <div class="overflow-hidden flex items-center w-full h-full">
      <ActionBar />
      <div class="w-min h-min relative border-y-8">{props.children}</div>
    </div>
  )
}
