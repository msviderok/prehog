import { useGlobalState } from '@/components/global-state/GlobalStateContext'
import { api } from '@/convex/api'
import type { Doc } from '@/convex/dataModel'
import { INTERPOLATION_DELAY_MS } from '@/lib/constants'
import { createRAFLoop } from '@/lib/createRAFLoop'
import { clamp, lerp } from '@/lib/utils'
import { useMutation } from 'convex-solidjs'
import { For } from 'solid-js'
import { Hat } from './Hat'
import { OtherPlayer } from './OtherPlayer'
import { SceneryNodes } from './SceneryNodes'

export function GameContent() {
  const { scene, player, nodes, otherPlayers } = useGlobalState()
  const sendBatch = useMutation(api.gameState.sendMyBatch)
  let eventBatch: Doc<'game_event_batches'>['batch'] = []

  createRAFLoop({
    autostart: true,
    fn: (_timestamp, dt, samplingTick, batchingTick, msSinceBatchStart) => {
      const velocity = player.direction * player.speed
      const distanceThisFrame = velocity * dt
      const distanceThisFrameInPX = distanceThisFrame * scene.worldUnit.x

      const shouldLockPlayerInPlace = player.realX > scene.cameraStartMovingX && player.realX < scene.cameraEndMovingX

      const shouldMoveSceneCamera =
        shouldLockPlayerInPlace && player.realX > scene.s50 && player.realX < scene.scaled.width

      scene.cameraX = clamp(
        0,
        scene.cameraX + (shouldMoveSceneCamera ? distanceThisFrameInPX : 0),
        scene.cameraViewportWidth,
      )

      scene.ref?.style.setProperty('--tx', `${-scene.cameraX}px`)

      player.x = clamp(scene.walkableMinX, player.x + distanceThisFrame, scene.walkableMaxX)
      player.realX = player.x * scene.worldUnit.x
      player.hitboxScaled.x1 = player.realX - player.scaledHalf.width
      player.hitboxScaled.x2 = player.realX + player.scaledHalf.width
      player.cameraX = clamp(
        player.cameraMinX,
        player.cameraX + (shouldLockPlayerInPlace ? 0 : distanceThisFrameInPX),
        player.cameraMaxX,
      )
      player.ref?.style.setProperty('--tx', `${player.cameraX}px`)

      let collided = false
      for (const node of nodes) {
        const nodeCollided = collisionDetected(player.hitboxScaled, node.hitboxScaled)
        if (node.type === 'player') {
          node.ref?.style.setProperty('--collided', nodeCollided)
        } else {
          node.rootRef?.style.setProperty('--collided', nodeCollided)
          node.popupRef?.style.setProperty('--is-open', nodeCollided)
        }

        if (nodeCollided === '1') collided = true
      }

      player.ref?.style.setProperty('--collided', collided ? '1' : '0')

      /** SAMPLING */
      if (samplingTick) {
        if (player.shouldSendBatches && player.direction !== 0) {
          eventBatch.push({ type: 'move', x: player.x, t: msSinceBatchStart })
        }
      }

      /** BATCHING */
      if (batchingTick) {
        if (player.shouldSendBatches && eventBatch.length > 0) {
          void sendBatch.mutate({ batch: eventBatch })
        }
        eventBatch = []
      }

      /** PROCESS OTHER USERS MOVEMENT */
      const renderTime = Date.now() - INTERPOLATION_DELAY_MS
      for (const [, otherPlayer] of otherPlayers.hashmap) {
        const batch = otherPlayer.batchQueue
        if (batch.length < 2) continue

        while (batch.length > 2 && batch[1]!.t <= renderTime) batch.shift()

        const a = batch[0]!
        const b = batch[1]!
        const alpha = Math.max(0, Math.min(1, (renderTime - a.t) / (b.t - a.t)))
        otherPlayer.x = lerp(a.x, b.x, alpha)
        otherPlayer.realX = otherPlayer.x * scene.worldUnit.x
        otherPlayer.hitbox.x1 = otherPlayer.x
        otherPlayer.hitbox.x2 = otherPlayer.x + otherPlayer.scaled.width
        otherPlayer.hitboxScaled.x1 = otherPlayer.realX - otherPlayer.scaledHalf.width
        otherPlayer.hitboxScaled.x2 = otherPlayer.realX + otherPlayer.scaledHalf.width
        otherPlayer.ref?.style.setProperty('--tx', `${otherPlayer.realX}px`)
      }
    },
  })

  return (
    <div class="w-min h-min relative">
      <div
        ref={(el) => (scene.ref = el)}
        class="main-scene relative shrink-0 overflow-hidden origin-top-left [image-rendering:pixelated] brightness-100"
      >
        <SceneryNodes />
        <For each={otherPlayers.list()}>{(userId) => <OtherPlayer id={userId} />}</For>
      </div>

      <div
        ref={(el) => (player.ref = el)}
        class="player player-idle hitbox"
        data-me={true}
        data-is-admin={player.isAdmin()}
      >
        <Hat hat={player.isAdmin() ? 'admin' : 'baseball'} />
      </div>
    </div>
  )
}

function collisionDetected(a: Hitbox, b: Hitbox) {
  return a.x1 < b.x2 && a.x2 > b.x1 && a.y1 < b.y2 && a.y2 > b.y1 ? '1' : '0'
}
