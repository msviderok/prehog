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
import {
  Tooltip,
  TooltipArrow,
  TooltipPopup,
  TooltipPortal,
  TooltipPositioner,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { api } from '@/convex/api'
import { useMutation } from 'convex-solidjs'
import { InfoIcon } from 'lucide-solid'

const y1 = 87
const y2 = 92
function xy(x1: number) {
  return { x1, x2: x1 + 3, y1, y2 }
}

export function Intro() {
  return (
    <Popover
      variant="scenery"
      sceneryProps={{
        position: { x: 19.99, y: 48 },
        hitbox: xy(10),
      }}
    >
      <PopoverTrigger />
      <PopoverPortal>
        <PopoverPositioner side="top" align="end">
          <PopoverPopup>
            <PopoverArrow />

            <PopoverHeader>
              <PopoverTitle>Oh, hey there! Welcome!</PopoverTitle>
            </PopoverHeader>

            <PopoverDescription>Here you can get to know me better.</PopoverDescription>
          </PopoverPopup>
        </PopoverPositioner>
      </PopoverPortal>
    </Popover>
  )
}

export function Experience() {
  const setScene = useMutation(api.gameState.setScene)
  return (
    <Popover
      variant="scenery"
      sceneryProps={{
        position: { x: 22.58, y: 70.1 },
        hitbox: xy(19),
      }}
    >
      <PopoverTrigger />
      <PopoverPortal>
        <PopoverPositioner side="left" align="end">
          <PopoverPopup class="text-xs">
            <PopoverArrow />

            <PopoverHeader>
              <PopoverTitle>Experience</PopoverTitle>
            </PopoverHeader>

            <PopoverDescription>
              <span>Here you can take a </span>
              <Tooltip>
                <TooltipTrigger render="span" class="text-ph-dark-cornflower-blue flex gap-1">
                  walkthrour <InfoIcon class="size-3.5" />
                </TooltipTrigger>
                <TooltipPortal>
                  <TooltipPositioner side="top">
                    <TooltipPopup>
                      <TooltipArrow />
                      <p>
                        It's <span class="italic underline">walkthrough</span> +{' '}
                        <span class="italic underline">tour</span>, get it? You get it, right?..
                      </p>
                    </TooltipPopup>
                  </TooltipPositioner>
                </TooltipPortal>
              </Tooltip>{' '}
              <span>of my professional experience.</span>
            </PopoverDescription>

            <PopoverFooter>
              <PopoverActionDoor hotkey="E" onHotkeyPress={() => void setScene.mutate({ scene: 'tour' })}>
                Take a tour
              </PopoverActionDoor>
            </PopoverFooter>
          </PopoverPopup>
        </PopoverPositioner>
      </PopoverPortal>
    </Popover>
  )
}

export function WhyAmIGoodForARole() {
  return (
    <Popover
      variant="scenery"
      sceneryProps={{
        position: { x: 52.34, y: 45.49 },
        hitbox: xy(48),
      }}
    >
      <PopoverTrigger />
      <PopoverPortal>
        <PopoverPositioner side="right" align="center">
          <PopoverPopup>
            <PopoverArrow />

            <PopoverHeader>
              <PopoverTitle>My Job Application for PostHog</PopoverTitle>
            </PopoverHeader>

            <PopoverDescription>
              This is my job application for the Posthog Product engineer position.
            </PopoverDescription>
          </PopoverPopup>
        </PopoverPositioner>
      </PopoverPortal>
    </Popover>
  )
}

export function MyProjects() {
  return (
    <Popover
      variant="scenery"
      sceneryProps={{
        position: { x: 50.64, y: 70.39 },
        hitbox: xy(44),
      }}
    >
      <PopoverTrigger />
      <PopoverPortal>
        <PopoverPositioner side="top" align="end">
          <PopoverPopup>
            <PopoverArrow />

            <PopoverHeader>
              <PopoverTitle>Personal Projects</PopoverTitle>
            </PopoverHeader>

            <PopoverDescription>
              This should list all of my (a single one lol) personal projects to show-off.
            </PopoverDescription>
          </PopoverPopup>
        </PopoverPositioner>
      </PopoverPortal>
    </Popover>
  )
}

export function PersonalStuff() {
  return (
    <Popover
      variant="scenery"
      sceneryProps={{
        position: { x: 82.64, y: 42.12 },
        hitbox: xy(76),
      }}
    >
      <PopoverTrigger />
      <PopoverPortal>
        <PopoverPositioner side="top" align="end">
          <PopoverPopup>
            <PopoverArrow />

            <PopoverHeader>
              <PopoverTitle>Personal Stuff</PopoverTitle>
            </PopoverHeader>

            <PopoverDescription>Here you can get to know me better.</PopoverDescription>
          </PopoverPopup>
        </PopoverPositioner>
      </PopoverPortal>
    </Popover>
  )
}

export function Temp1() {
  return (
    <Popover
      variant="scenery"
      sceneryProps={{
        position: { x: 84.31, y: 58.58 },
        hitbox: xy(82),
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
  )
}

export function Temp2() {
  return (
    <Popover
      variant="scenery"
      sceneryProps={{
        position: { x: 92.47, y: 64.63 },
        hitbox: xy(90),
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
  )
}
