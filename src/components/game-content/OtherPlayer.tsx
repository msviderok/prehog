import { api } from '@/convex/api'
import type { Id } from '@/convex/dataModel'
import { useMutation, useQuery } from 'convex-solidjs'
import { createEffect, createMemo, createRenderEffect, on, onCleanup, onMount } from 'solid-js'
import { useGlobalState } from '../global-state/GlobalStateContext'
import { Hat } from './Hat'

export function OtherPlayer(props: { id: Id<'users'> }) {
  let ref!: HTMLDivElement
  const { scene, otherPlayers } = useGlobalState()
  const { data: isAdmin } = useQuery(
    api.gameState.isUserAdmin,
    { userId: props.id },
    { keepPreviousData: true, initialData: false },
  )
  const { data: actionsBatch } = useQuery(api.gameState.getPlayerBatch, { userId: props.id })
  const { data: state } = useQuery(api.gameState.getPlayerGameState, { userId: props.id }, { keepPreviousData: true })
  const getInitialState = useMutation(api.gameState.getInitialState)

  const player = () => otherPlayers.hashmap.get(props.id)!

  createRenderEffect(() => {
    otherPlayers.hashmap.set(props.id, {
      get ref() {
        return ref
      },
      batchQueue: [],
      scaled: { width: 0, height: 0 },
      scaledHalf: { width: 0, height: 0 },
      hitboxScaled: { x1: 0, x2: 0, y1: 0, y2: 0 },
      x: 0,
      realX: 0,
    })
  })

  createEffect(() => {
    const b = actionsBatch()
    if (!b) return
    player().batchQueue.push(...b.batch)
  })

  createEffect(
    on(
      () => state()?.movementDir,
      (dir) => ref?.style.setProperty('--facing-dir', dir === 'left' ? '-1' : '1'),
    ),
  )

  createEffect(
    on(
      () => state()?.isRunning,
      (isRunning) => ref?.style.setProperty('--is-running', isRunning ? '1' : '0'),
    ),
  )

  createEffect(
    on(
      () => state()?.isWalking ?? false,
      (isWalking) => {
        ref?.classList.toggle('player-walk', isWalking)
        ref?.classList.toggle('player-idle', !isWalking)
      },
    ),
  )

  onMount(() => {
    getInitialState.mutate({ userId: props.id }).then((s) => {
      player().x = s.x
      player().realX = s.x * scene.worldUnit.x
      ref?.style.setProperty('--tx', `${player().realX}px`)
    })
  })

  onCleanup(() => {
    otherPlayers.hashmap.delete(props.id)
  })

  return (
    <div ref={(el) => (ref = el)} class="player hitbox" data-is-admin={isAdmin()}>
      <Hat hat={isAdmin() ? 'admin' : 'baseball'} />
    </div>
  )
}
