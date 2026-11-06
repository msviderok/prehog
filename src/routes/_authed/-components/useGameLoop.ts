import { api } from '@/convex/api'
import type { Doc } from '@/convex/dataModel'
import { INTERPOLATION_DELAY_MS, PLAYER_BASE_SPEED_PX_PER_SEC } from '@/lib/constants'
import { createRAFLoop } from '@/lib/createRAFLoop'
import { useSingleFlightMutation } from '@/lib/useSingleFlightMutation'
import { clamp, lerp } from '@/lib/utils'
import { useMutation } from 'convex-solidjs'
import { createEffect, on } from 'solid-js'
import { useGlobalState } from './GlobalStateContext'

export function useGameLoop() {
  const { player, scene, gameState } = useGlobalState()
  const sendBatch = useMutation(api.gameState.sendMyBatch)
  const updateMyPosition = useSingleFlightMutation(api.gameState.updateMyPosition)
  let eventBatch: Doc<'game_event_batches'>['batch'] = []
  let sceneCache: SceneCache
  let players: InteractiveNodeOf<'player'>[]

  createEffect(
    on(
      () => gameState.scene(),
      (currentSceneCache) => {
        sceneCache = currentSceneCache
      },
    ),
  )

  createRAFLoop(() => true, {
    autostart: true,
    fn: (_timestamp, dt, samplingTick, batchingTick, msSinceBatchStart, debugTick, offlinePositionUpdateTick) => {
      if (player.__gameloop.paused) return
      movePlayerAndCamera(dt)
      moveOtherPlayers()

      if (samplingTick) sampling(msSinceBatchStart)
      if (batchingTick) batching()
      if (debugTick) debugging()

      processMyOfflineMovement(offlinePositionUpdateTick)
      checkCollisions()
    },
  })

  function movePlayerAndCamera(dt: number) {
    if (player.__gameloop.isHijacked) return
    const velocity = player.__gameloop.direction * player.__gameloop.speed * dt
    const distanceThisFrameWU = (velocity * PLAYER_BASE_SPEED_PX_PER_SEC) / sceneCache.static.worldUnitX

    player.x = clamp(sceneCache.static.walkableMinX, player.x + distanceThisFrameWU, sceneCache.static.walkableMaxX)
    player.__gameloop.hitbox.x1 = player.x - sceneCache.static.playerHalfWidth
    player.__gameloop.hitbox.x2 = player.x + sceneCache.static.playerHalfWidth

    const cameraLeftX = clamp(
      0,
      player.x - sceneCache.scaled.s50WU,
      sceneCache.scaled.cameraEndTravelAtX - sceneCache.scaled.s50WU,
    )
    player.__gameloop.tx = (player.x - cameraLeftX) * sceneCache.static.worldUnitX
    scene.tx = cameraLeftX * sceneCache.static.worldUnitX
    player.ref?.style.setProperty('--tx', `${Math.round(player.__gameloop.tx)}px`)
    scene.ref?.style.setProperty('--scene-tx', `${-Math.round(scene.tx)}px`)
  }

  function moveOtherPlayers() {
    const renderTime = Date.now() - INTERPOLATION_DELAY_MS
    for (const otherPlayer of sceneCache.nodes.byType('player').values()) {
      const batch = otherPlayer.data.batchQueue
      if (batch.length < 2) continue

      while (batch.length > 2 && batch[1]!.t <= renderTime) batch.shift()

      const a = batch[0]!
      const b = batch[1]!
      const alpha = Math.max(0, Math.min(1, (renderTime - a.t) / (b.t - a.t)))
      otherPlayer.data.x = lerp(a.x, b.x, alpha)
      otherPlayer.hitbox.x1 = otherPlayer.data.x - sceneCache.static.playerHalfWidth
      otherPlayer.hitbox.x2 = otherPlayer.data.x + sceneCache.static.playerHalfWidth
      const otherPlayerPaintX = Math.round(otherPlayer.data.x * sceneCache.static.worldUnitX)
      otherPlayer.data.ref?.style.setProperty('--tx', `${otherPlayerPaintX}px`)
    }
  }

  function sampling(msSinceBatchStart: number) {
    if (player.__gameloop.shouldSendBatches && player.__gameloop.direction !== 0) {
      eventBatch.push({ type: 'move', x: player.x, t: msSinceBatchStart })
    }
  }

  function batching() {
    if (player.__gameloop.shouldSendBatches && eventBatch.length > 0) {
      void sendBatch.mutate({ batch: eventBatch })
    }
    eventBatch = []
  }

  function debugging() {}

  function processMyOfflineMovement(offlinePositionUpdateTick: boolean) {
    if (player.__gameloop.shouldSendBatches === false) {
      if (offlinePositionUpdateTick) {
        void updateMyPosition.mutate({ x: player.x })
      }
    }
  }

  function checkCollisions() {
    let collided = false
    console.log()
    for (const node of sceneCache.nodes.list.values()) {
      const nodeCollided = collisionDetected(player.__gameloop.hitbox, node.hitbox)
      if (node.collided() !== nodeCollided) node.setCollided(nodeCollided)
      if (nodeCollided) collided = true
    }

    player.ref?.style.setProperty('--collided', collided ? '1' : '0')
  }
}

function collisionDetected(a: Hitbox, b: Hitbox) {
  return a.x1 < b.x2 && a.x2 > b.x1 && a.y1 < b.y2 && a.y2 > b.y1
}
