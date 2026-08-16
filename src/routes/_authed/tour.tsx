import { Button } from '@/components/ui/button'
import { ButtonGroupText, ButtonGroupWrapper } from '@/components/ui/button-group'
import {
  Popover,
  PopoverArrow,
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
import { createFileRoute } from '@tanstack/solid-router'
import { useMutation } from 'convex-solidjs'

export const Route = createFileRoute('/_authed/tour')({
  staticData: { scene: 'tour' },
  component() {
    return (
      <>
        <DoorPopover />
      </>
    )
  },
})

function DoorPopover() {
  return (
    <Popover
      variant="scenery"
      sceneryProps={{
        position: { x: 22.58, y: 70.1 },
        hitbox: { x1: 20, y1: 75, x2: 25, y2: 100 },
      }}
    >
      <PopoverTrigger />
      <PopoverPortal>
        <PopoverPositioner side="left" align="end">
          <PopoverPopup class="text-xs">
            <PopoverArrow />

            <PopoverHeader>
              <PopoverTitle>Wanna go back?</PopoverTitle>
            </PopoverHeader>

            <PopoverFooter>
              <ButtonGroupWrapper>
                <Interact />
                <ButtonGroupText>Go back</ButtonGroupText>
              </ButtonGroupWrapper>
            </PopoverFooter>
          </PopoverPopup>
        </PopoverPositioner>
      </PopoverPortal>
    </Popover>
  )
}

function Interact() {
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
