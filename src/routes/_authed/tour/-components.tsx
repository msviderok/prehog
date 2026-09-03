import {
  Popover,
  PopoverActionDoor,
  PopoverArrow,
  PopoverDescription,
  PopoverFooter,
  PopoverHeader,
  PopoverPopup,
  PopoverPortal,
  PopoverPositioner,
  PopoverTitle,
  PopoverTrigger,
} from '@/components/ui/popover'
import { api } from '@/convex/api'
import { useSingleFlightMutation } from '@/lib/useSingleFlightMutation'

export function DoorPopover() {
  const setScene = useSingleFlightMutation(api.gameState.setScene)
  return (
    <Popover
      variant="scenery"
      sceneryProps={{
        anchorPosition: { x: 1, y: 73 },
        hitboxPosition: { x: 3, y: 96 },
      }}
    >
      <PopoverTrigger />
      <PopoverPortal>
        <PopoverPositioner side="top" align="start">
          <PopoverPopup class="text-xs">
            <PopoverArrow />

            <PopoverHeader>
              <PopoverTitle>Wanna go back?</PopoverTitle>
            </PopoverHeader>

            <PopoverFooter>
              <PopoverActionDoor hotkey="E" onHotkeyPress={() => void setScene.mutate({ scene: 'main' })}>
                Go back
              </PopoverActionDoor>
            </PopoverFooter>
          </PopoverPopup>
        </PopoverPositioner>
      </PopoverPortal>
    </Popover>
  )
}

export function Stage1() {
  return (
    <Popover
      variant="scenery"
      sceneryProps={{
        anchorPosition: { x: 12.3, y: 71.5 },
        hitboxPosition: { x: 12.3, y: 96 },
      }}
    >
      <PopoverTrigger />
      <PopoverPortal>
        <PopoverPositioner side="top" align="center">
          <PopoverPopup class="text-xs">
            <PopoverArrow />

            <PopoverHeader>
              <PopoverTitle>Stage 1</PopoverTitle>
            </PopoverHeader>

            <PopoverDescription>
              This is stage 1 of my experience. I should start with my PHP, React, RoR and all that stuff in Yedynka and
              PettersonApps. ALSO ELM MENTIONED SHOULD BE.
            </PopoverDescription>
          </PopoverPopup>
        </PopoverPositioner>
      </PopoverPortal>
    </Popover>
  )
}

export function Stage2() {
  return (
    <Popover
      variant="scenery"
      sceneryProps={{
        anchorPosition: { x: 30.3, y: 71.5 },
        hitboxPosition: { x: 30.3, y: 96 },
      }}
    >
      <PopoverTrigger />
      <PopoverPortal>
        <PopoverPositioner side="top" align="center">
          <PopoverPopup class="text-xs">
            <PopoverArrow />

            <PopoverHeader>
              <PopoverTitle>Stage 2</PopoverTitle>
            </PopoverHeader>

            <PopoverDescription>
              This is stage 2 of my experience. Probably should tell smth about my post-PettersonApps era.
            </PopoverDescription>
          </PopoverPopup>
        </PopoverPositioner>
      </PopoverPortal>
    </Popover>
  )
}

export function Stage3() {
  return (
    <Popover
      variant="scenery"
      sceneryProps={{
        anchorPosition: { x: 49.7, y: 71.5 },
        hitboxPosition: { x: 49.7, y: 96 },
      }}
    >
      <PopoverTrigger />
      <PopoverPortal>
        <PopoverPositioner side="top" align="center">
          <PopoverPopup class="text-xs">
            <PopoverArrow />

            <PopoverHeader>
              <PopoverTitle>Stage 3</PopoverTitle>
            </PopoverHeader>

            <PopoverDescription>
              This is stage 3 of my experience. The whole OverlayAnalytics journey begins...
            </PopoverDescription>
          </PopoverPopup>
        </PopoverPositioner>
      </PopoverPortal>
    </Popover>
  )
}

export function Stage4() {
  return (
    <Popover
      variant="scenery"
      sceneryProps={{
        anchorPosition: { x: 69.6, y: 71.5 },
        hitboxPosition: { x: 69.6, y: 96 },
      }}
    >
      <PopoverTrigger />
      <PopoverPortal>
        <PopoverPositioner side="top" align="center">
          <PopoverPopup class="text-xs">
            <PopoverArrow />

            <PopoverHeader>
              <PopoverTitle>Stage 4</PopoverTitle>
            </PopoverHeader>

            <PopoverDescription>
              This is stage 4 of my experience. Valora and everything afterwards like Base UI should be described here.
            </PopoverDescription>
          </PopoverPopup>
        </PopoverPositioner>
      </PopoverPortal>
    </Popover>
  )
}

export function Stage5() {
  return (
    <Popover
      variant="scenery"
      sceneryProps={{
        anchorPosition: { x: 89.6, y: 71.5 },
        hitboxPosition: { x: 89.6, y: 96 },
      }}
    >
      <PopoverTrigger />
      <PopoverPortal>
        <PopoverPositioner side="top" align="center">
          <PopoverPopup class="text-xs">
            <PopoverArrow />

            <PopoverHeader>
              <PopoverTitle>Stage 5</PopoverTitle>
            </PopoverHeader>

            <PopoverDescription>
              This is stage 5 of my experience. What do I imagine for myself in PostHog?
            </PopoverDescription>
          </PopoverPopup>
        </PopoverPositioner>
      </PopoverPortal>
    </Popover>
  )
}
