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
      <Intro />
      <Experience />
      <Wardrobe />
      <MyProjects />
      <WhyAmIGoodForARole />
      <Wardrobe2 />
      <Drawboard />
      <PersonalStuff />
      <Temp1 />
      <Temp2 />
      <LastDoor />

      <Scene.Players />
    </Scene.Elements>
  )
}

function Intro() {
  return (
    <SceneryPopover
      id="intro"
      side="left"
      align="end"
      anchor={{ position: { x: 9, y: 55 } }}
      marker={{ position: { x: 6, y: 94 } }}
      asset={(p) => <Asset {...p} routeId="/_authed/main/" asset="experience.png" x={8} y={51.8} scale={SCALE} />}
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
      side="bottom"
      align="center"
      anchor={{ position: { x: 21.5, y: 80 } }}
      marker={{ position: { x: 15.9, y: 94 }, onInteract: () => {}, label: 'Interact' }}
      asset={(p) => (
        <Asset {...p} routeId="/_authed/main/" asset="intro.png" x={12.48} y={-0.1} scale={SCALE} class="group">
          <Asset
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
      )}
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
  )
}

function Wardrobe() {
  return (
    <SceneryPopover
      id="wardrobe"
      anchor={{ position: { x: 30, y: 46 } }}
      marker={{ position: { x: 29.5, y: 94 } }}
      asset={(p) => (
        <Asset {...p} routeId="/_authed/main/" asset="building_3.png" x={24.73} y={-0.1} scale={SCALE} class="z-[-2]" />
      )}
    >
      <PopoverHeader>
        <PopoverTitle>Wardrobe</PopoverTitle>
      </PopoverHeader>

      <PopoverDescription>You can change your clothes here – free of charge!</PopoverDescription>
    </SceneryPopover>
  )
}

function MyProjects() {
  return (
    <SceneryPopover
      id="pet"
      side="top"
      align="end"
      anchor={{ position: { x: 40.6, y: 53 } }}
      marker={{ position: { x: 38, y: 94 } }}
      asset={(p) => (
        <Asset {...p} routeId="/_authed/main/" asset="pet.png" x={40} y={51.5} scale={SCALE} class="[--ry:180deg]" />
      )}
    >
      <PopoverHeader>
        <PopoverTitle>Personal Projects</PopoverTitle>
      </PopoverHeader>

      <PopoverDescription>
        This should list all of my (a single one lol) personal projects to show-off.
      </PopoverDescription>
    </SceneryPopover>
  )
}

function WhyAmIGoodForARole() {
  return (
    <SceneryPopover
      id="application"
      side="right"
      align="end"
      anchor={{ position: { x: 54.34, y: 46 } }}
      marker={{ position: { x: 47, y: 94 } }}
      asset={(p) => <Asset {...p} routeId="/_authed/main/" asset="application.png" x={43.1} y={-0.1} scale={SCALE} />}
    >
      <PopoverHeader>
        <PopoverTitle>My Job Application for PostHog</PopoverTitle>
      </PopoverHeader>

      <PopoverDescription>This is my job application for the Posthog Product engineer position.</PopoverDescription>

      <PopoverFooter>
        <PopoverActionDoor to="application">Explore</PopoverActionDoor>
      </PopoverFooter>
    </SceneryPopover>
  )
}

function Wardrobe2() {
  return (
    <SceneryPopover
      id="wardrobe2"
      anchor={{ position: { x: 55, y: 46 } }}
      marker={{ position: { x: 60, y: 94 } }}
      asset={(p) => (
        <Asset {...p} routeId="/_authed/main/" asset="building_5.png" x={54.12} y={0.1} scale={SCALE} class="z-[-2]" />
      )}
    >
      <PopoverHeader>
        <PopoverTitle>Wardrobe</PopoverTitle>
      </PopoverHeader>

      <PopoverDescription>You can change your clothes here – free of charge!</PopoverDescription>
    </SceneryPopover>
  )
}

function Drawboard() {
  return (
    <SceneryPopover
      id="drawboard"
      anchor={{ position: { x: 65, y: 46 } }}
      marker={{ position: { x: 65, y: 94 } }}
      asset={(p) => <Asset {...p} routeId="/_authed/main/" asset="building_1.png" x={63.35} y={-0.1} scale={SCALE} />}
    >
      <PopoverHeader>
        <PopoverTitle>Drawboard</PopoverTitle>
      </PopoverHeader>

      <PopoverDescription>I would expect you to be able to draw some random stuff over here, y'know</PopoverDescription>
    </SceneryPopover>
  )
}

function PersonalStuff() {
  return (
    <SceneryPopover
      id="personal"
      side="right"
      align="end"
      anchor={{ position: { x: 83, y: 48 } }}
      marker={{ position: { x: 77.8, y: 94 } }}
      asset={(p) => <Asset {...p} x={74.46} y={-0.3} scale={SCALE} routeId="/_authed/main/" asset="personal.png" />}
    >
      <PopoverHeader>
        <PopoverTitle>Personal Stuff</PopoverTitle>
      </PopoverHeader>

      <PopoverDescription>Here you can get to know me better.</PopoverDescription>

      <PopoverFooter>
        <PopoverActionDoor to="pet">Get to know me</PopoverActionDoor>
      </PopoverFooter>
    </SceneryPopover>
  )
}

function Temp1() {
  return (
    <SceneryPopover
      id="temp1"
      side="left"
      align="end"
      anchor={{ position: { x: 82.4, y: 58.58 } }}
      marker={{ position: { x: 82, y: 94 } }}
      asset={(p) => <Asset {...p} x={82} y={46} scale={SCALE} routeId="/_authed/main/" asset="temp1_with_table.png" />}
    >
      <span>hey, yo</span>
    </SceneryPopover>
  )
}

function Temp2() {
  return (
    <SceneryPopover
      id="temp2"
      side="left"
      align="end"
      anchor={{ position: { x: 87.3, y: 60 } }}
      marker={{ position: { x: 86, y: 94 } }}
      asset={(p) => <Asset {...p} x={86.44} y={43.2} scale={SCALE} routeId="/_authed/main/" asset="temp2.png" />}
    >
      <span>wassup, homie</span>
    </SceneryPopover>
  )
}

function LastDoor() {
  return (
    <>
      <SceneryPopover id="last-door" anchor={{ position: { x: 95, y: 46 } }} marker={{ position: { x: 95, y: 94 } }}>
        <PopoverHeader>
          <PopoverTitle>This is the end, my friend.</PopoverTitle>
        </PopoverHeader>

        <PopoverDescription>You can proceed with your life</PopoverDescription>
      </SceneryPopover>
    </>
  )
}
