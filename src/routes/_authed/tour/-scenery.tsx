import { PopoverDescription, PopoverHeader, PopoverTitle } from '@/components/ui/popover'
import * as Scene from '@/routes/_authed/-components/Scene'
import * as InteractiveNode from '@/routes/_authed/-components/interactive-layer'
import { Asset } from '../-components/Asset'

const MARKER_Y = 90
const POPOVER_Y = MARKER_Y - 30

export function Scenery() {
  return (
    <>
      <Scene.Background.Bare>
        <Asset routeId="/_authed/tour/" asset="Plaster_08-256x256.png" repeat class="size-full" />
        <Asset
          routeId="/_authed/tour/"
          asset="Wood_13-256x256.png"
          repeat
          class="w-full h-60 top-[unset] bottom-0 hue-rotate-120 brightness-60"
        />
        <Asset
          routeId="/_authed/tour/"
          asset="Dirt_05-128x128.png"
          repeat
          class="w-full h-60 top-[unset] bottom-0 opacity-0"
        />
        <Asset
          routeId="/_authed/application/"
          asset="pilar.png"
          class="bottom-55 top-[unset] -left-10 w-125 hue-rotate-335"
        />
        <Asset
          routeId="/_authed/application/"
          asset="pilar.png"
          class="bottom-55 top-[unset] left-[unset] -right-10 w-125 hue-rotate-335"
        />

        <Asset routeId="/_authed/tour/" asset="evolution.png" class="absolute-center-x" />
      </Scene.Background.Bare>

      <Scene.Elements>
        <Scene.Players />

        <InteractiveNode.Root id="door">
          <InteractiveNode.Preload.Route route="main" />
          <InteractiveNode.Marker.Root x={3} y={MARKER_Y}>
            <InteractiveNode.Marker.Pill label="Go back" goTo="main" />
          </InteractiveNode.Marker.Root>
        </InteractiveNode.Root>

        <InteractiveNode.Root id="stage1">
          <InteractiveNode.Marker.Root x={14} y={MARKER_Y} />

          <InteractiveNode.Popover anchorX={14} anchorY={POPOVER_Y} side="top" align="center">
            <PopoverHeader>
              <PopoverTitle>Stage 1</PopoverTitle>
            </PopoverHeader>{' '}
            <PopoverDescription>
              This is stage 1 of my experience. I should start with my PHP, React, RoR and all that stuff in Yedynka and
              PettersonApps. ALSO ELM MENTIONED SHOULD BE.
            </PopoverDescription>
          </InteractiveNode.Popover>
        </InteractiveNode.Root>

        <InteractiveNode.Root id="stage2">
          <InteractiveNode.Marker.Root x={31.5} y={MARKER_Y} />

          <InteractiveNode.Popover anchorX={31.5} anchorY={POPOVER_Y} side="top" align="center">
            <PopoverHeader>
              <PopoverTitle>Stage 2</PopoverTitle>
            </PopoverHeader>
            <PopoverDescription>
              This is stage 2 of my experience. Probably should tell smth about my post-PettersonApps era.
            </PopoverDescription>
          </InteractiveNode.Popover>
        </InteractiveNode.Root>

        <InteractiveNode.Root id="stage3">
          <InteractiveNode.Marker.Root x={50} y={MARKER_Y} />

          <InteractiveNode.Popover anchorX={50} anchorY={POPOVER_Y} side="top" align="center">
            <PopoverHeader>
              <PopoverTitle>Stage 3</PopoverTitle>
            </PopoverHeader>
            <PopoverDescription>
              This is stage 3 of my experience. The whole OverlayAnalytics journey begins...
            </PopoverDescription>
          </InteractiveNode.Popover>
        </InteractiveNode.Root>

        <InteractiveNode.Root id="stage4">
          <InteractiveNode.Marker.Root x={68.4} y={MARKER_Y} />

          <InteractiveNode.Popover anchorX={68.4} anchorY={POPOVER_Y} side="top" align="center">
            <PopoverHeader>
              <PopoverTitle>Stage 4</PopoverTitle>
            </PopoverHeader>
            <PopoverDescription>
              This is stage 4 of my experience. Valora and everything afterwards like Base UI should be described here.
            </PopoverDescription>
          </InteractiveNode.Popover>
        </InteractiveNode.Root>

        <InteractiveNode.Root id="stage5">
          <InteractiveNode.Marker.Root x={87} y={MARKER_Y} />

          <InteractiveNode.Popover anchorX={87} anchorY={POPOVER_Y} side="top" align="center">
            <PopoverHeader>
              <PopoverTitle>Stage 5</PopoverTitle>
            </PopoverHeader>
            <PopoverDescription>
              This is stage 5 of my experience. What do I imagine for myself in PostHog?
            </PopoverDescription>
          </InteractiveNode.Popover>
        </InteractiveNode.Root>
      </Scene.Elements>
    </>
  )
}
