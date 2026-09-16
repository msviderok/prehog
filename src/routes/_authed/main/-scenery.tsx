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
import { assets } from '@/routeAssets.gen'
import { Asset } from '@/routes/_authed/-components/Asset'
import * as Scene from '@/routes/_authed/-components/Scene'
import { SceneryPopover } from '@/routes/_authed/-components/SceneryPopover'
import { InfoIcon } from 'lucide-solid'

const SCALE = 1.475

export function Scenery() {
  return (
    <Scene.Elements>
      <IntroV2 />
      <ExperienceV2 />
      <MyProjects />
      <WhyAmIGoodForARole />
      <PersonalStuff />
      <Temp1 />
      <Temp2 />

      <Scene.Players />
    </Scene.Elements>
  )
}

function IntroV2() {
  return (
    <>
      <Asset nodeId="intro" routeId="/_authed/main/" asset="experience.png" x={8} y={51.8} scale={SCALE} />
      <SceneryPopover
        id="intro"
        side="left"
        align="end"
        anchor={{ position: { x: 9, y: 55 } }}
        marker={{ position: { x: 6, y: 94 } }}
      >
        <PopoverHeader>
          <PopoverTitle>Oh, hey there! Welcome!</PopoverTitle>
        </PopoverHeader>

        <PopoverDescription>Here you can get to know me better.</PopoverDescription>
      </SceneryPopover>
    </>
  )
}

function ExperienceV2() {
  return (
    <>
      <Asset
        nodeId="experience"
        routeId="/_authed/main/"
        asset="intro.png"
        x={12.48}
        y={-0.1}
        scale={SCALE}
        class="group"
      >
        <Asset
          nodeId="experience-sign"
          routeId="/_authed/main/"
          asset="sign.png"
          x={0}
          y={15}
          scale={SCALE}
          width={assets['/_authed/main/']['intro.png'].size.width * 0.5}
          class={`
            z-1 origin-bottom transition-transform
            [--pp:500px] [--rx:30deg] [--tz:100px] [--dtx:calc(var(--scene-tx)*-1+50%)]
            group-data-open:[--sy:1.3]
            group-data-open:[--rx:0]
          `}
        >
          <span class="game-transform transition-transform overlay z-1 comic text-5xl flex items-center justify-center tracking-[0.2em] group-data-open:[--sy:0.8]">
            Experience
          </span>
        </Asset>
      </Asset>

      <SceneryPopover
        id="experience"
        side="bottom"
        align="center"
        anchor={{ position: { x: 21.5, y: 80 } }}
        marker={{ position: { x: 15.9, y: 94 }, onInteract: () => {}, label: 'Interact' }}
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
      </SceneryPopover>
    </>
  )
}

function MyProjects() {
  return (
    <>
      <Asset
        nodeId="pet"
        routeId="/_authed/main/"
        asset="pet.png"
        x={35}
        y={51.5}
        scale={SCALE}
        class="[--ry:180deg]"
      />
      <SceneryPopover
        id="pet"
        side="top"
        align="end"
        anchor={{ position: { x: 35.6, y: 52 } }}
        marker={{ position: { x: 33, y: 94 } }}
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

function WhyAmIGoodForARole() {
  return (
    <>
      <Asset nodeId="application" routeId="/_authed/main/" asset="application.png" x={43.1} y={-0.1} scale={SCALE} />
      <SceneryPopover
        id="application"
        side="right"
        align="end"
        anchor={{ position: { x: 54.34, y: 46 } }}
        marker={{ position: { x: 47, y: 94 } }}
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

function PersonalStuff() {
  return (
    <>
      <Asset nodeId="personal" x={74.46} y={-0.3} scale={SCALE} routeId="/_authed/main/" asset="personal.png" />
      <SceneryPopover
        id="personal"
        side="right"
        align="end"
        anchor={{ position: { x: 83, y: 48 } }}
        marker={{ position: { x: 77.8, y: 94 } }}
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
      <Asset nodeId="temp1" x={82} y={46} scale={SCALE} routeId="/_authed/main/" asset="temp1_with_table.png" />
      <SceneryPopover
        id="temp1"
        side="left"
        align="end"
        anchor={{ position: { x: 82.4, y: 58.58 } }}
        marker={{ position: { x: 82, y: 94 } }}
      >
        <span>hey, yo</span>
      </SceneryPopover>
    </>
  )
}

function Temp2() {
  return (
    <>
      <Asset nodeId="temp2" x={86.44} y={43.2} scale={SCALE} routeId="/_authed/main/" asset="temp2.png" />
      <SceneryPopover
        id="temp2"
        side="left"
        align="end"
        anchor={{ position: { x: 87.3, y: 60 } }}
        marker={{ position: { x: 86, y: 94 } }}
      >
        <span>wassup, homie</span>
      </SceneryPopover>
    </>
  )
}
