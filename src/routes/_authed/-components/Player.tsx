import { KeycapButton } from '@/components/ui/button'
import { Tooltip, TooltipPopup, TooltipPortal, TooltipPositioner } from '@/components/ui/tooltip'
import { api } from '@/convex/api'
import type { Id } from '@/convex/dataModel'
import { DEFAULT_HAT_INDEX, DEFAULT_SKIN_INDEX, SKINS_BY_INDEX } from '@/lib/constants'
import { useStableQuery } from '@/lib/useStableQuery'
import { cn } from 'cn'
import { useMutation, useQuery } from 'convex-solidjs'
import { createEffect, createMemo, on, onMount, type ComponentProps } from 'solid-js'
import { useGlobalState } from './GlobalStateContext'
import { createInteractiveNode } from './interactive-layer/createInteractiveNode'
import { Portal } from 'solid-js/web'

interface Props<MyPlayer extends boolean | undefined> extends Pick<ComponentProps<'div'>, 'ref' | 'class'> {
  myPlayer?: MyPlayer
  player: CommonPlayerProps<MyPlayer extends true ? MyPlayerAction : OtherPlayerAction>
}

function PlayerDiv<MyPlayer extends boolean | undefined>(props: Props<MyPlayer>) {
  return (
    <div
      ref={props.ref}
      class={cn('player player-with-hat', props.class)}
      data-me={props.myPlayer}
      data-layout-id={props.myPlayer ? 'my-player' : undefined}
      data-is-admin={props.player.isAdmin()}
      data-direction={props.player.facingDirection() === 'left' ? -1 : 1}
      data-is-walking={+props.player.isWalking()}
      data-is-running={+props.player.isRunning()}
      data-action={props.player.action()}
      data-hat={props.player.hat()}
      data-skin={SKINS_BY_INDEX[props.player.skin()]}
    />
  )
}

export const Player = {
  Me() {
    const { player, interaction } = useGlobalState()
    return (
      <Portal mount={interaction.hostRef() ?? player.renderedSlotRef()}>
        <PlayerDiv myPlayer ref={player.ref} player={player} />
      </Portal>
    )
  },

  Other(props: { id: Id<'users'> }) {
    const { misc } = useGlobalState()

    const { data: userProfile } = useQuery(api.users.getProfile, { userId: props.id })
    const { data: actionsBatch } = useQuery(api.gameState.getPlayerBatch, { userId: props.id })
    const { data: state } = useStableQuery(api.gameState.getPlayerGameState, { userId: props.id })
    const { data: isAdmin } = useQuery(
      api.gameState.isUserAdmin,
      { userId: props.id },
      { keepPreviousData: true, initialData: false },
    )

    const otherPlayer = createInteractiveNode(props.id, 'player', {
      x: 0,
      ref: undefined,
      batchQueue: [],
      facingDirection: createMemo(() => state()?.movementDir ?? 'right'),
      isAdmin: createMemo(() => isAdmin() ?? false),
      isWalking: createMemo(() => state()?.isWalking ?? false),
      isRunning: createMemo(() => state()?.isRunning ?? false),
      hat: createMemo(() => state()?.hat ?? DEFAULT_HAT_INDEX),
      skin: createMemo(() => state()?.skin ?? DEFAULT_SKIN_INDEX),
      action: createMemo(() => 'idle' as const),
      isJumping: createMemo(() => false),
    })

    const getInitialState = useMutation(api.gameState.getInitialState)

    createEffect(on(actionsBatch, (b) => b && otherPlayer.data.batchQueue.push(...b.batch)))

    onMount(() => {
      void getInitialState.mutate({ userId: props.id }).then((s) => {
        otherPlayer.data.x = s.x
        otherPlayer.hitbox.x1 = s.x - misc.player.size.halfWidth
        otherPlayer.hitbox.x2 = s.x + misc.player.size.halfWidth
        otherPlayer.hitbox.y1 = misc.player.hitbox.y1
        otherPlayer.hitbox.y2 = misc.player.hitbox.y2
        otherPlayer.data.ref?.style.setProperty('--tx', `${otherPlayer.data.x}px`)
      })
    })

    return (
      <>
        <Tooltip variant="action" open={otherPlayer.collided()}>
          <TooltipPortal>
            <TooltipPositioner anchor={otherPlayer.data.ref} side="top" align="center">
              <TooltipPopup>
                <KeycapButton
                  onPress={() => {
                    console.log('Interact with', userProfile()?.fullname ?? 'USER_FULLNAME')
                  }}
                />
              </TooltipPopup>
            </TooltipPositioner>
          </TooltipPortal>
        </Tooltip>

        <PlayerDiv player={otherPlayer.data} />
      </>
    )
  },
}
