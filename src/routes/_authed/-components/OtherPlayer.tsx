import { api } from '@/convex/api'
import type { Id } from '@/convex/dataModel'
import { useStableQuery } from '@/lib/useStableQuery'
import { useMutation, useQuery } from 'convex-solidjs'
import { createEffect, on, onMount } from 'solid-js'
import { InteractButton } from '../../../components/ui/button'
import { Tooltip, TooltipPopup, TooltipPortal, TooltipPositioner } from '../../../components/ui/tooltip'
import { useGlobalState } from './GlobalStateContext'
import { Hat } from './Hat'
import { createInteractiveNode } from './interactive-layer/createInteractiveNode'

export function OtherPlayer(props: { id: Id<'users'> }) {
  let ref!: HTMLDivElement
  const { misc } = useGlobalState()
  const otherPlayer = createInteractiveNode(props.id, 'player', {
    x: 0,
    batchQueue: [],
    get ref() {
      return ref
    },
  })

  const getInitialState = useMutation(api.gameState.getInitialState)

  const { data: userProfile } = useQuery(api.users.getProfile, { userId: props.id })
  const { data: actionsBatch } = useQuery(api.gameState.getPlayerBatch, { userId: props.id })
  const { data: state } = useStableQuery(api.gameState.getPlayerGameState, { userId: props.id })
  const { data: isAdmin } = useQuery(
    api.gameState.isUserAdmin,
    { userId: props.id },
    { keepPreviousData: true, initialData: false },
  )

  createEffect(
    on(
      () => actionsBatch(),
      (b) => b && otherPlayer.data.batchQueue.push(...b.batch),
    ),
  )

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
      otherPlayer.data.x = s.x
      otherPlayer.hitbox.x1 = s.x - misc.player.size.halfWidth
      otherPlayer.hitbox.x2 = s.x + misc.player.size.halfWidth
      otherPlayer.hitbox.y1 = misc.player.hitbox.y1
      otherPlayer.hitbox.y2 = misc.player.hitbox.y2
      ref?.style.setProperty('--tx', `${otherPlayer.data.x}px`)
    })
  })

  return (
    <>
      <Tooltip variant="action" open={otherPlayer.collided()}>
        <TooltipPortal>
          <TooltipPositioner anchor={ref} side="top" align="center">
            <TooltipPopup>
              <InteractButton
                onPress={() => {
                  console.log('Interact with', userProfile()?.fullname ?? 'USER_FULLNAME')
                }}
              />
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
