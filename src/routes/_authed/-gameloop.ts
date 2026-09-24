import { api } from '@/convex/api'
import type { Doc } from '@/convex/dataModel'
import { INTERPOLATION_DELAY_MS, PLAYER_BASE_SPEED_PX_PER_SEC } from '@/lib/constants'
import { createRAFLoop } from '@/lib/createRAFLoop'
import { clamp, lerp } from '@/lib/utils'
import { useGlobalState } from '@/routes/_authed/-components/GlobalStateContext'
import { useMutation } from 'convex-solidjs'

export function runGameLoop() {
  const { scene, player, misc, nodes, otherPlayers } = useGlobalState()
  const sendBatch = useMutation(api.gameState.sendMyBatch)
  let eventBatch: Doc<'game_event_batches'>['batch'] = []

  let loggedOnce = false // declare above the loop

  createRAFLoop({
    autostart: true,
    fn: (_timestamp, dt, samplingTick, batchingTick, msSinceBatchStart, _debugTick) => {
      const velocity = (player.direction * player.speed * dt) / 100
      const distanceThisFrameWU = velocity * PLAYER_BASE_SPEED_PX_PER_SEC

      player.x = clamp(scene.walkableMinX, player.x + distanceThisFrameWU, scene.walkableMaxX)
      player.hitbox.x1 = player.x - misc.player.size.halfWidth
      player.hitbox.x2 = player.x + misc.player.size.halfWidth

      const cameraLeftX = clamp(0, player.x - scene.s50WU, scene.cameraEndTravelAtX - scene.s50WU)
      player.tx = (player.x - cameraLeftX) * scene.worldUnit.x
      scene.tx = cameraLeftX * scene.worldUnit.x
      player.ref?.style.setProperty('--tx', `${Math.round(player.tx)}px`)
      scene.ref?.style.setProperty('--scene-tx', `${-Math.round(scene.tx)}px`)

      if (_debugTick) {
        console.log(player.tx)
      }

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
        otherPlayer.hitbox.x1 = otherPlayer.x - misc.player.size.halfWidth
        otherPlayer.hitbox.x2 = otherPlayer.x + misc.player.size.halfWidth
        const otherPlayerPaintX = Math.round(otherPlayer.x * scene.worldUnit.x)
        otherPlayer.ref?.style.setProperty('--tx', `${otherPlayerPaintX}px`)
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

      if (_debugTick) {
        // inside the loop, after the setProperty lines
        const s = scene.ref?.getBoundingClientRect()
        const p = player.ref?.getBoundingClientRect()
        if (s && p && !loggedOnce) {
          loggedOnce = true
          console.log({
            playerX: player.x,
            cameraLeftX,
            expectedPlayerCenterPx: (player.x - cameraLeftX) * scene.worldUnit.x * scene.scale,
            actualPlayerCenterPx: p.left + p.width / 2,
            expectedSceneLeftPx: -cameraLeftX * scene.worldUnit.x * scene.scale,
            actualSceneLeftPx: s.left,
            windowScrollX: window.scrollX,
            viewportScrollLeft: document.querySelector('[data-viewport]')?.scrollLeft,
          })
        }
      }

      let collided = false
      for (const node of nodes) {
        const nodeCollided = collisionDetected(player.hitbox, node.hitbox)
        if (node.actions.open.value !== nodeCollided) {
          node.actions.open.value = nodeCollided
          node.actions.open.set(nodeCollided)
          node.rootRef?.style.setProperty('--collided', nodeCollided ? '1' : '0')
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
