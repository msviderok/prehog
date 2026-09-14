import {
  PopoverActionDoor,
  PopoverDescription,
  PopoverFooter,
  PopoverHeader,
  PopoverTitle,
} from '@/components/ui/popover'
import {
  Tooltip,
  TooltipArrow,
  TooltipPopup,
  TooltipPortal,
  TooltipPositioner,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Asset } from '@/routes/_authed/-components/Asset'
import * as Scene from '@/routes/_authed/-components/Scene'
import { SceneryPopover } from '@/routes/_authed/-components/SceneryPopover'
import { InfoIcon } from 'lucide-solid'

const SCALE = 1.475

export function Scenery() {
  return (
    <Scene.Elements>
      <Intro />
      <Experience />
      <WhyAmIGoodForARole />
      <MyProjects />
      <PersonalStuff />
      <Temp1 />
      <Temp2 />

      <Scene.Players />
    </Scene.Elements>
  )
}

function Intro() {
  return (
    <>
      <Asset nodeId="intro" routeId="/_authed/main/" asset="intro.png" x={5.3} y={-0.1} scale={SCALE} />
      <SceneryPopover
        id="intro"
        side="top"
        align="end"
        anchorPosition={{ x: 19.99, y: 48 }}
        markerPosition={{ x: 11, y: 94 }}
      >
        <PopoverHeader>
          <PopoverTitle>Oh, hey there! Welcome!</PopoverTitle>
        </PopoverHeader>

        <PopoverDescription>Here you can get to know me better.</PopoverDescription>
      </SceneryPopover>
    </>
  )
}

function Experience() {
  return (
    <>
      <Asset nodeId="experience" routeId="/_authed/main/" asset="experience.png" x={21.88} y={51.8} scale={SCALE} />
      <SceneryPopover
        id="experience"
        side="left"
        align="end"
        anchorPosition={{ x: 22.58, y: 70.1 }}
        markerPosition={{ x: 19, y: 94 }}
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
    </>
  )
}

function WhyAmIGoodForARole() {
  return (
    <>
      <Asset nodeId="application" routeId="/_authed/main/" asset="application.png" x={39.05} y={-0.1} scale={SCALE} />
      <SceneryPopover
        id="application"
        side="left"
        align="end"
        anchorPosition={{ x: 52.34, y: 45.49 }}
        markerPosition={{ x: 53, y: 94 }}
      >
        <PopoverHeader>
          <PopoverTitle>My Job Application for PostHog</PopoverTitle>
        </PopoverHeader>

        <PopoverDescription>This is my job application for the Posthog Product engineer position.</PopoverDescription>

        <PopoverFooter>
          <PopoverActionDoor to="application">Explore</PopoverActionDoor>
        </PopoverFooter>
      </SceneryPopover>
    </>
  )
}

function MyProjects() {
  return (
    <>
      <Asset nodeId="pet" routeId="/_authed/main/" asset="pet.png" x={44.8} y={51.5} scale={SCALE} />
      <SceneryPopover
        id="pet"
        side="bottom"
        align="start"
        anchorPosition={{ x: 50.64, y: 70.39 }}
        markerPosition={{ x: 41, y: 94 }}
      >
        <PopoverHeader>
          <PopoverTitle>Personal Projects</PopoverTitle>
        </PopoverHeader>

        <PopoverDescription>
          This should list all of my (a single one lol) personal projects to show-off.
        </PopoverDescription>
      </SceneryPopover>
    </>
  )
}

function PersonalStuff() {
  return (
    <>
      <Asset nodeId="personal" x={69.85} y={-0.1} scale={SCALE} routeId="/_authed/main/" asset="personal.png" />
      <SceneryPopover
        id="personal"
        side="top"
        align="end"
        anchorPosition={{ x: 82.64, y: 42.12 }}
        markerPosition={{ x: 74, y: 94 }}
      >
        <PopoverHeader>
          <PopoverTitle>Personal Stuff</PopoverTitle>
        </PopoverHeader>

        <PopoverDescription>Here you can get to know me better.</PopoverDescription>

        <PopoverFooter>
          <PopoverActionDoor to="pet">Get to know me</PopoverActionDoor>
        </PopoverFooter>
      </SceneryPopover>
    </>
  )
}

function Temp1() {
  return (
    <>
      <Asset nodeId="temp1" x={83.46} y={45.8} scale={SCALE} routeId="/_authed/main/" asset="temp1.png" />
      <SceneryPopover
        id="temp1"
        side="left"
        align="start"
        anchorPosition={{ x: 84.31, y: 58.58 }}
        markerPosition={{ x: 82, y: 94 }}
      >
        <span>hey, yo</span>
      </SceneryPopover>
    </>
  )
}

function Temp2() {
  return (
    <>
      <Asset nodeId="temp2" x={89.25} y={43.2} scale={SCALE} routeId="/_authed/main/" asset="temp2.png" />
      <SceneryPopover
        id="temp2"
        side="bottom"
        align="end"
        anchorPosition={{ x: 92.47, y: 64.63 }}
        markerPosition={{ x: 90, y: 94 }}
      >
        <span>wassup, homie</span>
      </SceneryPopover>
    </>
  )
}
