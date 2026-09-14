import { Asset } from '@/routes/_authed/-components/Asset'
import * as Scene from '@/routes/_authed/-components/Scene'
import {
  Popover,
  PopoverActionDoor,
  PopoverArrow,
  PopoverBackdrop,
  PopoverDescription,
  PopoverFooter,
  PopoverHeader,
  PopoverPopup,
  PopoverPortal,
  PopoverPositioner,
  PopoverTitle,
  PopoverTrigger,
} from '@/components/ui/popover'
import { SceneryPopover } from '@/routes/_authed/-components/SceneryPopover'
import {
  Tooltip,
  TooltipArrow,
  TooltipPopup,
  TooltipPortal,
  TooltipPositioner,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useRouter } from '@tanstack/solid-router'
import { InfoIcon } from 'lucide-solid'
import { createEffect, on } from 'solid-js'

export function Scenery() {
  return (
    <Scene.Elements>
      <Intro />
      <Experience />
      {/*<WhyAmIGoodForARole />
      <MyProjects />
      <PersonalStuff />
      <Temp1 />
      <Temp2 />*/}

      <Scene.Players />
    </Scene.Elements>
  )
}

function Intro() {
  return (
    <SceneryPopover
      id="intro"
      anchorPosition={{ x: 19.99, y: 48 }}
      markerPosition={{ x: 11, y: 94 }}
      side="top"
      align="end"
    >
      <PopoverHeader>
        <PopoverTitle>Oh, hey there! Welcome!</PopoverTitle>
      </PopoverHeader>

      <PopoverDescription>Here you can get to know me better.</PopoverDescription>
    </SceneryPopover>
  )
}

function Experience() {
  return (
    <SceneryPopover
      id="experience"
      anchorPosition={{ x: 22.58, y: 70.1 }}
      markerPosition={{ x: 19, y: 94 }}
      side="left"
      align="end"
    >
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
                  It's <span class="italic underline">walkthrough</span> + <span class="italic underline">tour</span>,
                  get it? You get it, right?..
                </p>
              </TooltipPopup>
            </TooltipPositioner>
          </TooltipPortal>
        </Tooltip>{' '}
        <span>of my professional experience.</span>
      </PopoverDescription>

      <PopoverFooter>
        <PopoverActionDoor to="tour">Take a tour</PopoverActionDoor>
      </PopoverFooter>
    </SceneryPopover>
  )
}

function WhyAmIGoodForARole() {
  const router = useRouter()
  return (
    <Popover
      variant="scenery"
      sceneryProps={{
        anchorPosition: { x: 52.34, y: 45.49 },
        hitboxPosition: { x: 53, y: 94 },
        onNodeRegistered: (node) => {
          createEffect(
            on(node.actions.open.get, (popoverOpen) => {
              if (popoverOpen) void router.preloadRoute({ to: '/application' })
            }),
          )
        },
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

            <PopoverFooter>
              <PopoverActionDoor to="application">Explore</PopoverActionDoor>
            </PopoverFooter>
          </PopoverPopup>
        </PopoverPositioner>
      </PopoverPortal>
    </Popover>
  )
}

function MyProjects() {
  return (
    <Popover
      variant="scenery"
      sceneryProps={{
        anchorPosition: { x: 50.64, y: 70.39 },
        hitboxPosition: { x: 41, y: 94 },
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

function PersonalStuff() {
  return (
    <Popover
      variant="scenery"
      sceneryProps={{
        anchorPosition: { x: 82.64, y: 42.12 },
        hitboxPosition: { x: 74, y: 94 },
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

            <PopoverFooter>
              <PopoverActionDoor to="pet">Get to know me</PopoverActionDoor>
            </PopoverFooter>
          </PopoverPopup>
        </PopoverPositioner>
      </PopoverPortal>
    </Popover>
  )
}

function Temp1() {
  return (
    <Popover
      variant="scenery"
      sceneryProps={{
        anchorPosition: { x: 84.31, y: 58.58 },
        hitboxPosition: { x: 82, y: 94 },
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

function Temp2() {
  return (
    <Popover
      variant="scenery"
      sceneryProps={{
        anchorPosition: { x: 92.47, y: 64.63 },
        hitboxPosition: { x: 90, y: 94 },
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
