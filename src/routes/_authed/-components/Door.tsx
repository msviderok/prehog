import {
  Popover,
  PopoverAction,
  PopoverBackdrop,
  PopoverFooter,
  PopoverPopup,
  PopoverPortal,
  PopoverPositioner,
  PopoverTrigger,
} from '@/components/ui/popover'
import { api } from '@/convex/api'
import { useSingleFlightMutation } from '@/lib/useSingleFlightMutation'
import { useGlobalState } from './GlobalStateContext'
import { PressE } from '../../../components/ui/button'
import { useSceneryPopoverNode } from './SceneryPopover'
import { createEffect, on } from 'solid-js'
import { useRouter } from '@tanstack/solid-router'

export function Door(props: {
  to: CurrentScene
  position: Coords
  /** @default "Go Back" */
  label?: string
}) {
  const router = useRouter()
  const node = useSceneryPopoverNode()
  const { player, misc } = useGlobalState()
  const setScene = useSingleFlightMutation(api.gameState.setScene)

  createEffect(
    on(node.actions.open.get, (popoverOpen) => {
      if (popoverOpen) void router.preloadRoute({ to: `/${props.to}` })
    }),
  )

  return (
    <Popover
      variant="scenery"
      flavour="action-only"
      sceneryProps={{
        hitboxPosition: props.position,
        anchorPosition: {
          x: props.position.x,
          y: props.position.y - misc.player.size.inWorldUnits.height * (3 / 4),
        },
      }}
    >
      <PopoverTrigger />
      <PopoverPortal>
        <PopoverBackdrop />
        <PopoverPositioner side="top" align="center">
          <PopoverPopup>
            <PopoverFooter>
              <PopoverAction class="flex flex-col items-center gap-4">
                <PressE onPress={() => void setScene.mutate({ scene: props.to, x: player.x })} class="animate-pulseY" />
                <span class="comic text-2xl text-ph-mustard-yellow animate-pulseY delay-200">
                  {props.label ?? 'Go Back'}
                </span>
              </PopoverAction>
            </PopoverFooter>
          </PopoverPopup>
        </PopoverPositioner>
      </PopoverPortal>
    </Popover>
  )
}
/**
 *
 * 0.63 -> 100%
 * 1 -> x
 */
