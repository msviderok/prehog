import { useGlobalState } from '@/components/GlobalStateContext'
import { createGameLoop } from '@/lib/createGameLoop'
import { createKeyboardListener } from '@/lib/createKeyboardListener'
import { UserEventQueue } from '@/lib/UserEventQueue'
import { clamp, scaleToFit } from '@/lib/utils'
import { useMutation } from 'convex-solidjs'
import { onCleanup, onMount, type ParentProps } from 'solid-js'
import { api } from '../../convex/_generated/api'

const MOVEMENT_SPEED = 0.5
const PLAYER_WIDTH = 32
const PLAYER_HEIGHT = 80
let temp = 0

export function MainContainer(props: ParentProps<{}>) {
  createKeyboardListener()

  // oxlint-disable-next-line no-unassigned-vars
  let containerRef!: HTMLDivElement
  const { setSceneSettings, setMe, me, keyPressed, sceneSettings, batchInterval, samplingInterval } = useGlobalState()
  const updateMe = useMutation(api.users.updateMe)

  const eventQueue = new UserEventQueue<any>()
  let eventBatch: any[] = []
  let lastSubmittedBatch: any[] = []
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
      const sceneRealWidth = sceneSettings.scaledSize.sceneWidth - window.innerWidth
      // Viewport "camera" position
      const cameraOffsetX = clamp(me.realPosition.x > s50 ? me.realPosition.x - s50 : 0, 0, sceneRealWidth)
      sceneSettings.ref.style.transform = `translateX(${-cameraOffsetX}px) scale(${sceneSettings.scale})`

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
          lastSubmittedBatch = eventBatch
          eventBatch = []
        }

        return
      }
    },
  })

  onMount(() => {
    const containerRect = containerRef.getBoundingClientRect()

    setSceneSettings({
      x: containerRect.left,
      y: containerRect.top,
      sceneWidth: containerRef.scrollWidth,
      sceneHeight: containerRef.scrollHeight,
      viewportWidth: containerRect.width,
      viewportHeight: containerRect.height,
      x2: containerRect.left + containerRect.width,
      y2: containerRect.top + containerRect.height,
      scale: scaleToFit(containerRect.height),
    })

    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (window.innerHeight < entry.target.scrollHeight) {
          setSceneSettings('scale', scaleToFit(entry.target.scrollHeight))
        }
      }
    })

    ro.observe(containerRef)

    // window.addEventListener('beforeunload', () => {
    //   void updateMe.mutate({ actions: lastSubmittedBatch, x: me.x, y: me.y })
    // })

    onCleanup(() => {
      ro.disconnect()
    })
  })

  return (
    <div ref={containerRef} class="w-full h-full origin-top-left relative">
      {props.children}
    </div>
  )
}
