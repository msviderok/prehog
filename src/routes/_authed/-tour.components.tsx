import { Button } from '@/components/ui/button'
import { ButtonGroupText, ButtonGroupWrapper } from '@/components/ui/button-group'
import {
  Popover,
  PopoverArrow,
  PopoverDescription,
  PopoverFooter,
  PopoverHeader,
  PopoverPopup,
  PopoverPortal,
  PopoverPositioner,
  PopoverTitle,
  PopoverTrigger,
  usePopoverContext,
} from '@/components/ui/popover'
import { api } from '@/convex/api'
import { useMutation } from 'convex-solidjs'

export function DoorPopover() {
  return (
    <Popover
      variant="scenery"
      sceneryProps={{
        position: { x: 1, y: 73 },
        hitbox: { x1: 0, y1: 75, x2: 1, y2: 100 },
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
              <ButtonGroupWrapper>
                <DoorInteract />
                <ButtonGroupText>Go back</ButtonGroupText>
              </ButtonGroupWrapper>
            </PopoverFooter>
          </PopoverPopup>
        </PopoverPositioner>
      </PopoverPortal>
    </Popover>
  )
}

function DoorInteract() {
  const ctx = usePopoverContext()
  const setScene = useMutation(api.gameState.setScene)

  return (
    <Button
      variant="game-action"
      animate="scale"
      size="icon"
      hotkey="E"
      disabled={!ctx.node?.actions.open.get()}
      onHotkeyPress={() => void setScene.mutate({ scene: 'main' })}
    >
      E
    </Button>
  )
}

export function Stage1() {
  return (
    <Popover
      variant="scenery"
      sceneryProps={{
        position: { x: 12.5, y: 71.5 },
        hitbox: { x1: 9.4, x2: 15.5, y1: 75, y2: 100 },
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
        position: { x: 30.5, y: 71.5 },
        hitbox: { x1: 27.3, x2: 33.4, y1: 75, y2: 100 },
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
        position: { x: 50, y: 71.5 },
        hitbox: { x1: 46.8, x2: 52.9, y1: 75, y2: 100 },
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
        position: { x: 69.6, y: 71.5 },
        hitbox: { x1: 66.6, x2: 72.7, y1: 75, y2: 100 },
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
        position: { x: 89.6, y: 71.5 },
        hitbox: { x1: 86.6, x2: 92.7, y1: 75, y2: 100 },
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
