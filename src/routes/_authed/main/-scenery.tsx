import { Prose } from '@/components/Prose'
import { PopoverDescription, PopoverHeader, PopoverTitle } from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'
import {
  Tooltip,
  TooltipArrow,
  TooltipPopup,
  TooltipPortal,
  TooltipPositioner,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { api } from '@/convex/api'
import { useSingleFlightMutation } from '@/lib/useSingleFlightMutation'
import { assets } from '@/routeAssets.gen'
import { Asset } from '@/routes/_authed/-components/Asset'
import * as Scene from '@/routes/_authed/-components/Scene'
import * as EventMarker from '@/routes/_authed/-components/interactive-layer/EventMarker'
import * as InteractiveNode from '@/routes/_authed/-components/interactive-layer/InteractiveNode'
import { cn } from 'cn'
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
    <InteractiveNode.Root id="intro">
      <InteractiveNode.Asset routeId="/_authed/main/" asset="experience.png" x={8} y={51.8} scale={SCALE} />
      <InteractiveNode.Anchor x={10} y={50} />
      <InteractiveNode.Marker x={6} y={94}>
        <EventMarker.Pill
          onInteract={(node) => {
            console.log(node.collided())
          }}
        />
      </InteractiveNode.Marker>

      <InteractiveNode.Content>
        <PopoverHeader>
          <PopoverTitle>Hawg</PopoverTitle>
          <Separator />
        </PopoverHeader>

        <PopoverDescription>
          <Prose>
            <p>Hey there, welcome! I'm Hawg.</p>
            <p>Would you like me to give you a tour of this place or do you wanna wonder on your own?</p>
          </Prose>
        </PopoverDescription>
      </InteractiveNode.Content>
    </InteractiveNode.Root>
  )
}

function Experience() {
  const setScene = useSingleFlightMutation(api.gameState.setScene)
  return (
    <InteractiveNode.Root id="experience">
      <InteractiveNode.Asset routeId="/_authed/main/" asset="intro.png" x={12.48} y={-0.1} scale={SCALE} class="group">
        <Asset
          routeId="/_authed/main/"
          asset="sign.png"
          x={0}
          y={15}
          scale={SCALE}
          width={assets['/_authed/main/']['intro.png'].size.width * 0.5}
          class={cn(`
            z-1 origin-bottom transition-transform
            [--pp:500px] [--rx:30deg] [--tz:100px] [--dtx:calc(var(--scene-tx)*-1+50%)]
            group-data-open:[--sy:1.3]
            group-data-open:[--rx:0deg]
            group-data-open:after:bg-black
          `)}
        >
          <span
            class={cn(`
            game-transform transition-transform overlay z-1 comic text-[70px] flex items-center justify-center tracking-[0.15em]
            group-data-open:[--sy:0.8]
            group-data-open:text-ph-mustard-yellow
            group-data-open:comic-shadow-black
            group-data-open:animate-blink-neon-sign
          `)}
          >
            Experience
          </span>
        </Asset>
      </InteractiveNode.Asset>
      <InteractiveNode.Anchor x={21.5} y={80} side="bottom" align="center" />
      <InteractiveNode.PreloadRoute route="tour" />
      <InteractiveNode.Marker x={15.9} y={94}>
        <EventMarker.Pill
          onInteract={() => setScene.mutate({ scene: 'tour' })}
          label="Explore"
          offsetX={0.1}
          offsetY={-43}
        />
      </InteractiveNode.Marker>
      <InteractiveNode.Content>
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
      </InteractiveNode.Content>
    </InteractiveNode.Root>
  )
}

function Wardrobe() {
  return (
    <InteractiveNode.Root id="wardrobe">
      <InteractiveNode.Asset
        routeId="/_authed/main/"
        asset="building_3.png"
        x={24.73}
        y={-0.1}
        scale={SCALE}
        class="z-[-2]"
      />
      <InteractiveNode.Anchor x={30} y={34} side="top" align="center" />
      <InteractiveNode.Marker x={29.5} y={94}>
        <EventMarker.Pill offsetX={-2} offsetY={-28.2} label="Explore" onInteract={() => {}} />
      </InteractiveNode.Marker>
      <InteractiveNode.Content>
        <PopoverHeader>
          <PopoverTitle>Wardrobe</PopoverTitle>
        </PopoverHeader>

        <PopoverDescription>You can change your clothes here – free of charge!</PopoverDescription>
      </InteractiveNode.Content>
    </InteractiveNode.Root>
  )
}

function MyProjects() {
  return (
    <InteractiveNode.Root id="pet">
      <InteractiveNode.Asset
        routeId="/_authed/main/"
        asset="pet.png"
        x={40}
        y={51.5}
        scale={SCALE}
        class="[--ry:180deg]"
      />
      <InteractiveNode.Anchor x={40.6} y={53} side="top" align="end" />
      <InteractiveNode.Marker x={38} y={94} />
      <InteractiveNode.Content>
        <PopoverHeader>
          <PopoverTitle>Personal Projects</PopoverTitle>
        </PopoverHeader>

        <PopoverDescription>
          d This should list all of my (a single one lol) personal projects to show-off.
        </PopoverDescription>
      </InteractiveNode.Content>
    </InteractiveNode.Root>
  )
}

function WhyAmIGoodForARole() {
  const setScene = useSingleFlightMutation(api.gameState.setScene)
  return (
    <InteractiveNode.Root id="application">
      <InteractiveNode.Asset routeId="/_authed/main/" asset="application.png" x={43.1} y={-0.1} scale={SCALE} />
      <InteractiveNode.Anchor x={54} y={80} side="bottom" align="end" />
      <InteractiveNode.Marker x={47} y={94}>
        <EventMarker.Pill
          offsetX={5.5}
          offsetY={-22.2}
          label="Explore"
          onInteract={() => setScene.mutate({ scene: 'application' })}
        />
      </InteractiveNode.Marker>

      <InteractiveNode.Content>
        <PopoverHeader>
          <PopoverTitle>My Job Application for PostHog</PopoverTitle>
        </PopoverHeader>

        <PopoverDescription>This is my job application for the Posthog Product engineer position.</PopoverDescription>
      </InteractiveNode.Content>
    </InteractiveNode.Root>
  )
}

function Wardrobe2() {
  return (
    <InteractiveNode.Root id="wardrobe2">
      <InteractiveNode.Asset
        routeId="/_authed/main/"
        asset="building_5.png"
        x={54.12}
        y={0.1}
        scale={SCALE}
        class="z-[-2]"
      />
      <InteractiveNode.Anchor x={55} y={46} />
      <InteractiveNode.Marker x={60} y={94} />
      <InteractiveNode.Content>
        <PopoverHeader>
          <PopoverTitle>Wardrobe</PopoverTitle>
        </PopoverHeader>

        <PopoverDescription>You can change your clothes here – free of charge!</PopoverDescription>
      </InteractiveNode.Content>
    </InteractiveNode.Root>
  )
}

function Drawboard() {
  return (
    <InteractiveNode.Root id="drawboard">
      <InteractiveNode.Asset routeId="/_authed/main/" asset="building_1.png" x={63.35} y={-0.1} scale={SCALE} />
      <InteractiveNode.Anchor x={65} y={46} />
      <InteractiveNode.Marker x={65} y={94} />
      <InteractiveNode.Content>
        <PopoverHeader>
          <PopoverTitle>Drawboard</PopoverTitle>
        </PopoverHeader>

        <PopoverDescription>
          I would expect you to be able to draw some random stuff over here, y'know
        </PopoverDescription>
      </InteractiveNode.Content>
    </InteractiveNode.Root>
  )
}

function PersonalStuff() {
  return (
    <InteractiveNode.Root id="personal">
      <InteractiveNode.Asset x={74.46} y={-0.3} scale={SCALE} routeId="/_authed/main/" asset="personal.png" />
      <InteractiveNode.Anchor x={83} y={48} side="right" align="end" />
      <InteractiveNode.Marker x={77.8} y={94}>
        <EventMarker.Pill onInteract={() => {}} label="Interact" />
      </InteractiveNode.Marker>
      <InteractiveNode.Content>
        <PopoverHeader>
          <PopoverTitle>Personal Stuff</PopoverTitle>
        </PopoverHeader>

        <PopoverDescription>Here you can get to know me better.</PopoverDescription>
      </InteractiveNode.Content>
    </InteractiveNode.Root>
  )
}

function Temp1() {
  return (
    <InteractiveNode.Root id="temp1">
      <InteractiveNode.Asset x={82} y={46} scale={SCALE} routeId="/_authed/main/" asset="temp1_with_table.png" />
      <InteractiveNode.Anchor x={82.4} y={58.58} side="left" align="end" />
      <InteractiveNode.Marker x={82} y={94} />
      <InteractiveNode.Content>
        <span>hey, yo</span>
      </InteractiveNode.Content>
    </InteractiveNode.Root>
  )
}

function Temp2() {
  return (
    <InteractiveNode.Root id="temp2">
      <InteractiveNode.Asset x={86.44} y={43.2} scale={SCALE} routeId="/_authed/main/" asset="temp2.png" />
      <InteractiveNode.Anchor x={87.3} y={60} side="left" align="end" />
      <InteractiveNode.Marker x={86} y={94} />
      <InteractiveNode.Content>
        <span>wassup, homie</span>
      </InteractiveNode.Content>
    </InteractiveNode.Root>
  )
}

function LastDoor() {
  return (
    <InteractiveNode.Root id="last-door">
      <InteractiveNode.Anchor x={95} y={46} />
      <InteractiveNode.Marker x={95} y={94} />
      <InteractiveNode.Content>
        <PopoverHeader>
          <PopoverTitle>This is the end, my friend.</PopoverTitle>
        </PopoverHeader>

        <PopoverDescription>You can proceed with your life</PopoverDescription>
      </InteractiveNode.Content>
    </InteractiveNode.Root>
  )
}
