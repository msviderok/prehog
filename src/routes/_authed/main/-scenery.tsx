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
import { assets } from '@/routeAssets.gen'
import { Asset } from '@/routes/_authed/-components/Asset'
import * as Scene from '@/routes/_authed/-components/Scene'
import * as InteractiveNode from '@/routes/_authed/-components/interactive-layer'
import { cn } from 'cn'
import { InfoIcon } from 'lucide-solid'

const SCALE = 1.475
const MARKER_Y = 94

export function Scenery() {
  return (
    <Scene.Elements>
      <InteractiveNode.Root id="intro">
        <InteractiveNode.Asset routeId="/_authed/main/" asset="experience.png" x={8} y={51.8} scale={SCALE} />
        <InteractiveNode.Marker.Root x={6} y={MARKER_Y} />

        <InteractiveNode.Popover anchorX={10} anchorY={50} side="top" align="end">
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
        </InteractiveNode.Popover>
      </InteractiveNode.Root>

      <InteractiveNode.Root id="experience">
        <InteractiveNode.Preload.Route route="tour" />

        <InteractiveNode.Asset
          routeId="/_authed/main/"
          asset="intro.png"
          x={12.48}
          y={-0.1}
          scale={SCALE}
          class="group"
        >
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

        <InteractiveNode.Marker.Root x={15.9} y={MARKER_Y}>
          <InteractiveNode.Marker.Pill goTo="tour" label="Explore" offsetX={0.1} offsetY={-43} />
        </InteractiveNode.Marker.Root>

        <InteractiveNode.Popover anchorX={21.5} anchorY={80} side="bottom" align="center">
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
        </InteractiveNode.Popover>
      </InteractiveNode.Root>

      <InteractiveNode.Root id="wardrobe">
        <InteractiveNode.Preload.Asset routeId="/_authed/" asset="skin_dyno_idle.png" />
        <InteractiveNode.Preload.Asset routeId="/_authed/" asset="skin_dyno_walk.png" />

        <InteractiveNode.Asset
          routeId="/_authed/main/"
          asset="building_3.png"
          x={24.73}
          y={-0.1}
          scale={SCALE}
          class="z-[-2]"
        />

        <InteractiveNode.Marker.Root x={29.5} y={MARKER_Y}>
          <InteractiveNode.Marker.Pill offsetX={-2} offsetY={-28.2} label="Explore" onInteract={() => {}} />
        </InteractiveNode.Marker.Root>

        <InteractiveNode.Popover anchorX={30} anchorY={34} side="top" align="center">
          <PopoverHeader>
            <PopoverTitle>Wardrobe</PopoverTitle>
          </PopoverHeader>
          <PopoverDescription>You can change your clothes here – free of charge!</PopoverDescription>
        </InteractiveNode.Popover>
      </InteractiveNode.Root>

      <InteractiveNode.Root id="pet">
        <InteractiveNode.Asset
          routeId="/_authed/main/"
          asset="pet.png"
          x={40}
          y={51.5}
          scale={SCALE}
          class="[--ry:180deg]"
        />
        <InteractiveNode.Marker.Root x={38} y={MARKER_Y} />

        <InteractiveNode.Popover anchorX={40.6} anchorY={53} side="top" align="end">
          <PopoverHeader>
            <PopoverTitle>Personal Projects</PopoverTitle>
          </PopoverHeader>
          <PopoverDescription>
            d This should list all of my (a single one lol) personal projects to show-off.
          </PopoverDescription>
        </InteractiveNode.Popover>
      </InteractiveNode.Root>

      <InteractiveNode.Root id="application">
        <InteractiveNode.Preload.Route route="application" />
        <InteractiveNode.Asset routeId="/_authed/main/" asset="application.png" x={43.1} y={-0.1} scale={SCALE} />

        <InteractiveNode.Marker.Root x={47} y={MARKER_Y}>
          <InteractiveNode.Marker.Pill offsetX={5.5} offsetY={-22.2} label="Explore" goTo="application" />
        </InteractiveNode.Marker.Root>

        <InteractiveNode.Popover anchorX={54} anchorY={80} side="bottom" align="end">
          <PopoverHeader>
            <PopoverTitle>My Job Application for PostHog</PopoverTitle>
          </PopoverHeader>
          <PopoverDescription>This is my job application for the Posthog Product engineer position.</PopoverDescription>
        </InteractiveNode.Popover>
      </InteractiveNode.Root>

      <InteractiveNode.Root id="wardrobe2">
        <InteractiveNode.Asset
          routeId="/_authed/main/"
          asset="building_5.png"
          x={54.12}
          y={0.1}
          scale={SCALE}
          class="z-[-2]"
        />
        <InteractiveNode.Marker.Root x={60} y={MARKER_Y} />

        <InteractiveNode.Popover anchorX={55} anchorY={46}>
          <PopoverHeader>
            <PopoverTitle>Wardrobe</PopoverTitle>
          </PopoverHeader>
          <PopoverDescription>You can change your clothes here – free of charge!</PopoverDescription>
        </InteractiveNode.Popover>
      </InteractiveNode.Root>

      <InteractiveNode.Root id="drawboard">
        <InteractiveNode.Asset routeId="/_authed/main/" asset="building_1.png" x={63.35} y={-0.1} scale={SCALE} />
        <InteractiveNode.Marker.Root x={65} y={MARKER_Y} />

        <InteractiveNode.Popover anchorX={65} anchorY={46}>
          <PopoverHeader>
            <PopoverTitle>Drawboard</PopoverTitle>
          </PopoverHeader>
          <PopoverDescription>
            I would expect you to be able to draw some random stuff over here, y'know
          </PopoverDescription>
        </InteractiveNode.Popover>
      </InteractiveNode.Root>

      <InteractiveNode.Root id="personal">
        <InteractiveNode.Preload.Route route="personal" />
        <InteractiveNode.Asset x={74.46} y={-0.3} scale={SCALE} routeId="/_authed/main/" asset="personal.png" />

        <InteractiveNode.Marker.Root x={77.8} y={MARKER_Y}>
          <InteractiveNode.Marker.Pill onInteract={() => {}} label="Interact" />
        </InteractiveNode.Marker.Root>

        <InteractiveNode.Popover anchorX={83} anchorY={48} side="right" align="end">
          <PopoverHeader>
            <PopoverTitle>Personal Stuff</PopoverTitle>
          </PopoverHeader>
          <PopoverDescription>Here you can get to know me better.</PopoverDescription>
        </InteractiveNode.Popover>
      </InteractiveNode.Root>

      <InteractiveNode.Root id="temp1">
        <InteractiveNode.Asset x={82} y={46} scale={SCALE} routeId="/_authed/main/" asset="temp1_with_table.png" />
        <InteractiveNode.Marker.Root x={82} y={MARKER_Y} />

        <InteractiveNode.Popover anchorX={82.4} anchorY={58.58} side="left" align="end">
          <span>hey, yo</span>
        </InteractiveNode.Popover>
      </InteractiveNode.Root>

      <InteractiveNode.Root id="temp2">
        <InteractiveNode.Asset x={86.44} y={43.2} scale={SCALE} routeId="/_authed/main/" asset="temp2.png" />
        <InteractiveNode.Marker.Root x={86} y={MARKER_Y} />

        <InteractiveNode.Popover anchorX={87.3} anchorY={60} side="left" align="end">
          <span>wassup, homie</span>
        </InteractiveNode.Popover>
      </InteractiveNode.Root>

      <InteractiveNode.Root id="last-door">
        <InteractiveNode.Marker.Root x={95} y={MARKER_Y} />

        <InteractiveNode.Popover anchorX={95} anchorY={46}>
          <PopoverHeader>
            <PopoverTitle>This is the end, my friend.</PopoverTitle>
          </PopoverHeader>
          <PopoverDescription>You can proceed with your life</PopoverDescription>
        </InteractiveNode.Popover>
      </InteractiveNode.Root>

      <Scene.Players />
    </Scene.Elements>
  )
}
