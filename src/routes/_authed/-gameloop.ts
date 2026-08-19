import { useGlobalState } from '@/components/GlobalStateContext'
import { api } from '@/convex/api'
import type { Doc } from '@/convex/dataModel'
import { INTERPOLATION_DELAY_MS } from '@/lib/constants'
import { createRAFLoop } from '@/lib/createRAFLoop'
import { clamp, lerp } from '@/lib/utils'
import { useMutation } from 'convex-solidjs'

export function runGameLoop() {
  const { scene, player, misc, nodes, otherPlayers } = useGlobalState()
  const sendBatch = useMutation(api.gameState.sendMyBatch)
  let eventBatch: Doc<'game_event_batches'>['batch'] = []

  createRAFLoop({
    autostart: true,
    fn: (_timestamp, dt, samplingTick, batchingTick, msSinceBatchStart) => {
      const velocity = player.direction * player.speed
      const distanceThisFrameInPX = velocity * dt
      const distanceThisFrame = distanceThisFrameInPX / scene.worldUnit.x

      /** Scene/camera movement */
      const shouldLockPlayerInPlace = player.realX > scene.cameraStartMovingX && player.realX < scene.cameraEndMovingX
      const shouldMoveSceneCamera =
        shouldLockPlayerInPlace && player.realX > scene.s50 && player.realX < scene.scaled.width

      const smoothing = 1 - Math.exp(-10 * dt)
      const targetCameraX = shouldMoveSceneCamera
        ? clamp(0, player.realX - scene.s50, scene.cameraViewportWidth)
        : scene.cameraX
      scene.cameraX += (targetCameraX - scene.cameraX) * smoothing
      scene.ref?.style.setProperty('--tx', `${-Math.round(scene.cameraX)}px`)

      /** My player movement */
      player.x = clamp(scene.walkableMinX, player.x + distanceThisFrame, scene.walkableMaxX)
      player.realX = player.x * scene.worldUnit.x

      player.hitbox.inWorldUnits.x1 = player.x - misc.player.size.inWorldUnits.halfWidth
      player.hitbox.inWorldUnits.x2 = player.x + misc.player.size.inWorldUnits.halfWidth
      player.hitbox.inPX.x1 = player.realX - misc.player.size.inPX.halfWidth
      player.hitbox.inPX.x2 = player.realX + misc.player.size.inPX.halfWidth

      player.cameraX = clamp(
        player.cameraMinX,
        player.cameraX + (shouldLockPlayerInPlace ? 0 : distanceThisFrameInPX),
        player.cameraMaxX,
      )
      player.ref?.style.setProperty('--tx', `${player.cameraX}px`)

      /** Other players' movement */
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
        otherPlayer.hitbox.inWorldUnits.x1 = otherPlayer.x - misc.player.size.inWorldUnits.halfWidth
        otherPlayer.hitbox.inWorldUnits.x2 = otherPlayer.hitbox.inWorldUnits.x1 + misc.player.size.inWorldUnits.width
        otherPlayer.hitbox.inPX.x1 = otherPlayer.realX - misc.player.size.inPX.halfWidth
        otherPlayer.hitbox.inPX.x2 = otherPlayer.hitbox.inPX.x1 + misc.player.size.inPX.width
        otherPlayer.ref?.style.setProperty('--tx', `${otherPlayer.realX}px`)
      }

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

      let collided = false
      for (const node of nodes) {
        const nodeCollided = collisionDetected(player.hitbox.inWorldUnits, node.hitbox.inWorldUnits)
        const v = nodeCollided ? '1' : '0'
        if (node.type === 'player') {
          node.ref?.style.setProperty('--collided', v)
        } else {
          node.rootRef?.style.setProperty('--collided', v)
          node.popupRef?.style.setProperty('--is-open', v)
        }

        if (node.actions.open.value !== nodeCollided) {
          node.actions.open.value = nodeCollided
          node.actions.open.set(nodeCollided)
        }

        if (nodeCollided) collided = true
      }

      player.ref?.style.setProperty('--collided', collided ? '1' : '0')
    },
  })
}

function collisionDetected(a: Hitbox, b: Hitbox) {
  return a.x1 < b.x2 && a.x2 > b.x1 && a.y1 < b.y2 && a.y2 > b.y1
}
