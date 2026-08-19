import { api } from '@/convex/api'
import type { Id } from '@/convex/dataModel'
import { useStableQuery } from '@/lib/useStableQuery'
import { useMutation, useQuery } from 'convex-solidjs'
import { createEffect, createRenderEffect, createSignal, on, onCleanup, onMount } from 'solid-js'
import { useGlobalState } from './GlobalStateContext'
import { Button } from './ui/button'
import { Tooltip, TooltipPopup, TooltipPortal, TooltipPositioner } from './ui/tooltip'
import { Hat } from './Hat'

export function OtherPlayer(props: { id: Id<'users'> }) {
  let ref!: HTMLDivElement
  let sceneNode: SceneNodePlayer | undefined
  const { scene, nodes, misc, otherPlayers } = useGlobalState()
  const [nodeOpen, setNodeOpen] = createSignal(false)

  const getInitialState = useMutation(api.gameState.getInitialState)

  const { data: userProfile } = useQuery(api.users.getProfile, { userId: props.id })
  const { data: actionsBatch } = useQuery(api.gameState.getPlayerBatch, { userId: props.id })
  const { data: state } = useStableQuery(api.gameState.getPlayerGameState, { userId: props.id })
  const { data: isAdmin } = useQuery(
    api.gameState.isUserAdmin,
    { userId: props.id },
    { keepPreviousData: true, initialData: false },
  )

  const otherPlayer = () => otherPlayers.hashmap.get(props.id)!

  createRenderEffect(() => {
    const newOtherPlayer: OtherPlayer = {
      get ref() {
        return ref
      },
      x: 0,
      realX: 0,
      batchQueue: [],
      hitbox: {
        inPX: { x1: 0, x2: 0, y1: 0, y2: 0 },
        inWorldUnits: { x1: 0, x2: 0, y1: 0, y2: 0 },
      },
    }

    otherPlayers.hashmap.set(props.id, newOtherPlayer)

    sceneNode = {
      type: 'player',
      actions: {
        open: {
          value: false,
          get: nodeOpen,
          set: setNodeOpen,
        },
      },
      hitbox: newOtherPlayer.hitbox,
      get ref() {
        return newOtherPlayer.ref
      },
    }
    nodes.add(sceneNode)
  })

  onCleanup(() => {
    otherPlayers.hashmap.delete(props.id)
    if (sceneNode) nodes.delete(sceneNode)
  })

  createEffect(() => {
    const b = actionsBatch()
    if (!b) return
    otherPlayer().batchQueue.push(...b.batch)
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
      otherPlayer().x = s.x
      otherPlayer().realX = s.x * scene.worldUnit.x

      otherPlayer().hitbox.inWorldUnits.x1 = s.x - misc.player.size.inWorldUnits.halfWidth
      otherPlayer().hitbox.inWorldUnits.x2 = s.x + misc.player.size.inWorldUnits.halfWidth
      otherPlayer().hitbox.inWorldUnits.y1 = misc.player.hitbox.inWorldUnits.y1
      otherPlayer().hitbox.inWorldUnits.y2 = misc.player.hitbox.inWorldUnits.y2

      otherPlayer().hitbox.inPX.x1 = otherPlayer().realX - misc.player.size.inPX.halfWidth
      otherPlayer().hitbox.inPX.x2 = otherPlayer().realX + misc.player.size.inPX.halfWidth
      otherPlayer().hitbox.inPX.y1 = misc.player.hitbox.inPX.y1
      otherPlayer().hitbox.inPX.y2 = misc.player.hitbox.inPX.y2
      ref?.style.setProperty('--tx', `${otherPlayer().realX}px`)
    })
  })

  return (
    <>
      <Tooltip variant="action" open={nodeOpen()}>
        <TooltipPortal>
          <TooltipPositioner anchor={ref} side="top" align="center">
            <TooltipPopup>
              <Button
                variant="game-action"
                hotkey="E"
                onHotkeyPress={() => {
                  console.log('Interact with', userProfile()?.fullname ?? 'USER_FULLNAME')
                }}
              >
                E
              </Button>
            </TooltipPopup>
          </TooltipPositioner>
        </TooltipPortal>
      </Tooltip>

      <div ref={(el) => (ref = el)} data-is-admin={isAdmin()} class="player pointer-events-none">
        <Hat hat={isAdmin() ? 'admin' : 'baseball'} />
      </div>
    </>
  )
}
