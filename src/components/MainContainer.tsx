import { useGlobalState } from '@/components/GlobalStateContext'
import { createGameLoop } from '@/lib/createGameLoop'
import { createKeyboardListener } from '@/lib/createKeyboardListener'
import { clamp } from '@/lib/utils'
import { createEffect, onMount, type ParentProps } from 'solid-js'

const MOVEMENT_SPEED = 0.1
const DT_MOD = 10

export function MainContainer(props: ParentProps<{}>) {
  createKeyboardListener()

  // oxlint-disable-next-line no-unassigned-vars
  let containerRef!: HTMLDivElement
  const { setMe, me, keyPressed, sceneSettings, batchInterval, samplingInterval } = useGlobalState()

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
      speed = moveDirection * MOVEMENT_SPEED * dt
      /** ––– CAMERA VIEWPORT ––– */

      /**
       * Scrollable width of the screen to allow free player movement at the first 50%
       * of the viewport width at the start and end of the scene
       */
      const sceneRealWidth = sceneSettings.realSceneSize.width - window.innerWidth
      // Viewport "camera" position
      const cameraOffsetX = clamp(me.realPosition.x > s50 ? me.realPosition.x - s50 : 0, 0, sceneRealWidth)
      const lastHalfScreenOffset = cameraOffsetX >= sceneRealWidth

      sceneSettings.ref.style.height = `${sceneSettings.realSceneSize.height}px`
      sceneSettings.ref.style.width = `${sceneSettings.realSceneSize.width}px`
      sceneSettings.ref.style.transform = `translateX(${-cameraOffsetX}px)`

      /** ––– PLAYER POSITION ––– */
      const playerTop = sceneSettings.worldUnit.y * me.y
      const playerLeft = clamp(
        me.realPosition.x - me.rect.width / 2 + (lastHalfScreenOffset ? -cameraOffsetX : 0),
        0 + me.rect.width / 2,
        window.innerWidth * (lastHalfScreenOffset ? 1 : 0.5) - me.rect.width / 2,
      )
      me.ref.style.top = `${playerTop}px`
      me.ref.style.left = `${playerLeft}px`

      // Keyboard input
      if (keyPressed.d || keyPressed.a) {
        // Push to the batch at the sampling interval
        if (timestamp - samplingStartTime >= samplingInterval()) {
          const newX =
            me.x +
            ((me.rect.left <= 0 && moveDirection === -1) || (me.rect.right >= window.innerWidth && moveDirection === 1)
              ? 0
              : speed)
          const fixedY = clamp(me.y, 0, 100)
          const fixedX = clamp(newX, 0, 100)
          const event = {
            type: 'move',
            y: fixedY,
            x: fixedX,
            timeSinceBatchStart: timestamp - samplingStartTime,
          }
          setMe({ x: fixedX, y: fixedY })
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
    <div ref={containerRef} class="overflow-hidden flex items-center w-full h-full">
      <div class="w-min h-min relative border-y-8">{props.children}</div>
    </div>
  )
}
