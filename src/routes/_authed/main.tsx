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
import { createFileRoute } from '@tanstack/solid-router'
import { useMutation } from 'convex-solidjs'

export const Route = createFileRoute('/_authed/main')({
  staticData: { scene: 'main' },
  component() {
    return (
      <>
        <IntroPopover />

        <Popover
          variant="scenery"
          sceneryProps={{
            position: { x: 19.99, y: 48 },
            hitbox: { x1: 10, y1: 75, x2: 15, y2: 100 },
          }}
        >
          <PopoverTrigger />
          <PopoverPortal>
            <PopoverPositioner side="top" align="end">
              <PopoverPopup>
                <PopoverArrow />
                <span>yo, dawg</span>
              </PopoverPopup>
            </PopoverPositioner>
          </PopoverPortal>
        </Popover>

        <Popover
          variant="scenery"
          sceneryProps={{
            position: { x: 50.64, y: 70.39 },
            hitbox: { x1: 44, y1: 75, x2: 53, y2: 100 },
          }}
        >
          <PopoverTrigger />
          <PopoverPortal>
            <PopoverPositioner side="right" align="center">
              <PopoverPopup>
                <PopoverArrow />
                <span>wazzup, fam</span>
              </PopoverPopup>
            </PopoverPositioner>
          </PopoverPortal>
        </Popover>
        <Popover
          variant="scenery"
          sceneryProps={{
            position: { x: 52.34, y: 45.49 },
            hitbox: { x1: 48, y1: 75, x2: 58, y2: 100 },
          }}
        >
          <PopoverTrigger />
          <PopoverPortal>
            <PopoverPositioner side="top" align="end">
              <PopoverPopup>
                <PopoverArrow />
                <span>sup, bro</span>
              </PopoverPopup>
            </PopoverPositioner>
          </PopoverPortal>
        </Popover>
        <Popover
          variant="scenery"
          sceneryProps={{
            position: { x: 82.64, y: 42.12 },
            hitbox: { x1: 76, y1: 75, x2: 86, y2: 100 },
          }}
        >
          <PopoverTrigger />
          <PopoverPortal>
            <PopoverPositioner side="top" align="end">
              <PopoverPopup>
                <PopoverArrow />
                <span>what's up, man</span>
              </PopoverPopup>
            </PopoverPositioner>
          </PopoverPortal>
        </Popover>

        <Popover
          variant="scenery"
          sceneryProps={{
            position: { x: 84.31, y: 58.58 },
            hitbox: { x1: 82, y1: 75, x2: 88, y2: 100 },
          }}
        >
          <PopoverTrigger />
          <PopoverPortal>
            <PopoverPositioner side="left" align="start">
              <PopoverPopup>
                <PopoverArrow />
                <span>hey, yo</span>
              </PopoverPopup>
            </PopoverPositioner>
          </PopoverPortal>
        </Popover>

        <Popover
          variant="scenery"
          sceneryProps={{
            position: { x: 92.47, y: 64.63 },
            hitbox: { x1: 90, y1: 75, x2: 100, y2: 100 },
          }}
        >
          <PopoverTrigger />
          <PopoverPortal>
            <PopoverPositioner side="bottom" align="end">
              <PopoverPopup>
                <PopoverArrow />
                <span>wassup, homie</span>
              </PopoverPopup>
            </PopoverPositioner>
          </PopoverPortal>
        </Popover>
      </>
    )
  },
})

function IntroPopover() {
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
              <PopoverTitle>Welcome!</PopoverTitle>
            </PopoverHeader>

            <PopoverDescription>
              This is my job application for the Posthog Product engineer position.
            </PopoverDescription>

            <PopoverFooter>
              <ButtonGroupWrapper>
                <Interact />
                <ButtonGroupText>Take a tour!</ButtonGroupText>
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
      onHotkeyPress={() => void setScene.mutate({ scene: 'tour' })}
    >
      E
    </Button>
  )
}
