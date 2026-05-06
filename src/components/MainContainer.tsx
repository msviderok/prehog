import { useGlobalState } from '@/components/GlobalStateContext'
import { createGameLoop } from '@/lib/createGameLoop'
import { createKeyboardListener } from '@/lib/createKeyboardListener'
import { clamp } from '@/lib/utils'
import { createEffect, onMount, type ParentProps } from 'solid-js'

const MOVEMENT_SPEED = 0.5
const PLAYER_WIDTH = 32
const PLAYER_HEIGHT = 80
let temp = 0

export function MainContainer(props: ParentProps<{}>) {
  createKeyboardListener()

  // oxlint-disable-next-line no-unassigned-vars
  let containerRef!: HTMLDivElement
  const { setSceneSettings, setMe, me, keyPressed, sceneSettings, batchInterval, samplingInterval } = useGlobalState()

  createEffect(() => {
    console.log(sceneSettings)
  })

  let eventBatch: any[] = []
  let batchingStartTime = 0
  let samplingStartTime = 0

  createGameLoop({
    autostart: true,
    fn: (timestamp) => {
      /** ––– CAMERA VIEWPORT ––– */

      // 50% of the screen width
      const s50 = window.innerWidth * 0.5
      /**
       * Scrollable width of the screen to allow free player movement at the first 50%
       * of the viewport width at the start and end of the scene
       */
      const sceneRealWidth = sceneSettings.realSceneSize.width - window.innerWidth
      // Viewport "camera" position
      const cameraOffsetX = clamp(me.realPosition.x > s50 ? me.realPosition.x - s50 : 0, 0, sceneRealWidth)

      // frameRef.style.transform = `scale(${sceneSettings.scale})`
      sceneSettings.ref.style.height = `${sceneSettings.realSceneSize.height}px`
      sceneSettings.ref.style.width = `${sceneSettings.realSceneSize.width}px`
      sceneSettings.ref.style.transform = `translateX(${-cameraOffsetX}px)`

      /** ––– PLAYER POSITION ––– */
      // Player position
      const playerWidth = sceneSettings.scale * PLAYER_WIDTH
      const playerHeight = sceneSettings.scale * PLAYER_HEIGHT
      const playerTop = sceneSettings.worldUnit.y * me.y

      const lastHalfScreenOffset = cameraOffsetX >= sceneRealWidth
      const playerLeft = clamp(
        me.realPosition.x + (lastHalfScreenOffset ? -cameraOffsetX : 0),
        0,
        window.innerWidth * (lastHalfScreenOffset ? 1 : 0.5) - me.rect.width,
      )
      me.ref.style.top = `${playerTop}px`
      me.ref.style.left = `${playerLeft}px`
      me.ref.style.width = `${playerWidth}px`
      me.ref.style.height = `${playerHeight}px`

      if (timestamp - temp >= 1000) {
        temp = timestamp
      }

      // Keyboard input
      if (keyPressed.d || keyPressed.a) {
        // Push to the batch at the sampling interval
        if (timestamp - samplingStartTime >= samplingInterval()) {
          const newY = me.y
          const newX = me.x + (keyPressed.d ? MOVEMENT_SPEED : -MOVEMENT_SPEED)
          const fixedY = clamp(newY, 0, 100)
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

  onMount(() => {
    const containerRect = containerRef.getBoundingClientRect()
    const sceneRect = sceneSettings.ref.getBoundingClientRect()
    setSceneSettings({
      originalWidth: sceneRect.width,
      originalHeight: sceneRect.height,
      x: containerRect.left,
      y: containerRect.top,
      x2: containerRect.left + containerRect.width,
      y2: containerRect.top + containerRect.height,
    })
  })

  return (
    <div ref={containerRef} class="overflow-hidden flex items-center w-full h-full">
      <div class="w-min h-min relative">{props.children}</div>
    </div>
  )
}
