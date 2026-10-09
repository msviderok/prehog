import { PopoverDescription, PopoverHeader, PopoverTitle } from '@/components/ui/popover'
import * as Scene from '@/routes/_authed/-components/Scene'
import * as InteractiveNode from '@/routes/_authed/-components/interactive-layer'

export function Scenery() {
  return (
    <Scene.Elements>
      <Scene.Players />

      <InteractiveNode.Root id="door">
        <InteractiveNode.Preload.Route route="main" />
        <InteractiveNode.Marker.Root x={3} y={96}>
          <InteractiveNode.Marker.Pill label="Go back" goTo="main" />
        </InteractiveNode.Marker.Root>
      </InteractiveNode.Root>

      <InteractiveNode.Root id="stage1">
        <InteractiveNode.Marker.Root x={12.3} y={96} />

        <InteractiveNode.Popover anchorX={12.3} anchorY={71.5} side="top" align="center">
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
        <InteractiveNode.Marker.Root x={30.3} y={96} />

        <InteractiveNode.Popover anchorX={30.3} anchorY={71.5} side="top" align="center">
          <PopoverHeader>
            <PopoverTitle>Stage 2</PopoverTitle>
          </PopoverHeader>
          <PopoverDescription>
            This is stage 2 of my experience. Probably should tell smth about my post-PettersonApps era.
          </PopoverDescription>
        </InteractiveNode.Popover>
      </InteractiveNode.Root>

      <InteractiveNode.Root id="stage3">
        <InteractiveNode.Marker.Root x={49.7} y={96} />

        <InteractiveNode.Popover anchorX={49.7} anchorY={71.5} side="top" align="center">
          <PopoverHeader>
            <PopoverTitle>Stage 3</PopoverTitle>
          </PopoverHeader>
          <PopoverDescription>
            This is stage 3 of my experience. The whole OverlayAnalytics journey begins...
          </PopoverDescription>
        </InteractiveNode.Popover>
      </InteractiveNode.Root>

      <InteractiveNode.Root id="stage4">
        <InteractiveNode.Marker.Root x={69.6} y={96} />

        <InteractiveNode.Popover anchorX={69.6} anchorY={71.5} side="top" align="center">
          <PopoverHeader>
            <PopoverTitle>Stage 4</PopoverTitle>
          </PopoverHeader>
          <PopoverDescription>
            This is stage 4 of my experience. Valora and everything afterwards like Base UI should be described here.
          </PopoverDescription>
        </InteractiveNode.Popover>
      </InteractiveNode.Root>

      <InteractiveNode.Root id="stage5">
        <InteractiveNode.Marker.Root x={89.6} y={96} />

        <InteractiveNode.Popover anchorX={89.6} anchorY={71.5} side="top" align="center">
          <PopoverHeader>
            <PopoverTitle>Stage 5</PopoverTitle>
          </PopoverHeader>
          <PopoverDescription>
            This is stage 5 of my experience. What do I imagine for myself in PostHog?
          </PopoverDescription>
        </InteractiveNode.Popover>
      </InteractiveNode.Root>
    </Scene.Elements>
  )
}
