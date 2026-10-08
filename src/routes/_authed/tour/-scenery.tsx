import { PopoverDescription, PopoverHeader, PopoverTitle } from '@/components/ui/popover'
import * as Scene from '@/routes/_authed/-components/Scene'
import * as InteractiveNode from '@/routes/_authed/-components/interactive-layer'
import { useSingleFlightMutation } from '@/lib/useSingleFlightMutation'
import { api } from '@/convex/api'

export function Scenery() {
  return (
    <Scene.Elements>
      <Scene.Players />

      <Door />
      <Stage1 />
      <Stage2 />
      <Stage3 />
      <Stage4 />
      <Stage5 />
    </Scene.Elements>
  )
}

function Door() {
  const setScene = useSingleFlightMutation(api.gameState.setScene)
  return (
    <InteractiveNode.Root id="door">
      <InteractiveNode.Preload.Route route="main" />
      <InteractiveNode.Marker.Root x={3} y={96}>
        <InteractiveNode.Marker.Pill label="Go back" onInteract={() => setScene.mutate({ scene: 'main' })} />
      </InteractiveNode.Marker.Root>
    </InteractiveNode.Root>
  )
}

export function Stage1() {
  return (
    <InteractiveNode.Root id="stage1">
      <InteractiveNode.Marker.Root x={12.3} y={96} />

      <InteractiveNode.Popover.Anchor x={12.3} y={71.5} side="top" align="center" />
      <InteractiveNode.Popover.Content>
        <PopoverHeader>
          <PopoverTitle>Stage 1</PopoverTitle>
        </PopoverHeader>
        <PopoverDescription>
          This is stage 1 of my experience. I should start with my PHP, React, RoR and all that stuff in Yedynka and
          PettersonApps. ALSO ELM MENTIONED SHOULD BE.
        </PopoverDescription>
      </InteractiveNode.Popover.Content>
    </InteractiveNode.Root>
  )
}

export function Stage2() {
  return (
    <InteractiveNode.Root id="stage2">
      <InteractiveNode.Marker.Root x={30.3} y={96} />

      <InteractiveNode.Popover.Anchor x={30.3} y={71.5} side="top" align="center" />
      <InteractiveNode.Popover.Content>
        <PopoverHeader>
          <PopoverTitle>Stage 2</PopoverTitle>
        </PopoverHeader>

        <PopoverDescription>
          This is stage 2 of my experience. Probably should tell smth about my post-PettersonApps era.
        </PopoverDescription>
      </InteractiveNode.Popover.Content>
    </InteractiveNode.Root>
  )
}

export function Stage3() {
  return (
    <InteractiveNode.Root id="stage3">
      <InteractiveNode.Marker.Root x={49.7} y={96} />

      <InteractiveNode.Popover.Anchor x={49.7} y={71.5} side="top" align="center" />
      <InteractiveNode.Popover.Content>
        <PopoverHeader>
          <PopoverTitle>Stage 3</PopoverTitle>
        </PopoverHeader>

        <PopoverDescription>
          This is stage 3 of my experience. The whole OverlayAnalytics journey begins...
        </PopoverDescription>
      </InteractiveNode.Popover.Content>
    </InteractiveNode.Root>
  )
}

export function Stage4() {
  return (
    <InteractiveNode.Root id="stage4">
      <InteractiveNode.Marker.Root x={69.6} y={96} />

      <InteractiveNode.Popover.Anchor x={69.6} y={71.5} side="top" align="center" />
      <InteractiveNode.Popover.Content>
        <PopoverHeader>
          <PopoverTitle>Stage 4</PopoverTitle>
        </PopoverHeader>

        <PopoverDescription>
          This is stage 4 of my experience. Valora and everything afterwards like Base UI should be described here.
        </PopoverDescription>
      </InteractiveNode.Popover.Content>
    </InteractiveNode.Root>
  )
}

export function Stage5() {
  return (
    <InteractiveNode.Root id="stage5">
      <InteractiveNode.Marker.Root x={89.6} y={96} />

      <InteractiveNode.Popover.Anchor x={89.6} y={71.5} side="top" align="center" />
      <InteractiveNode.Popover.Content>
        <PopoverHeader>
          <PopoverTitle>Stage 5</PopoverTitle>
        </PopoverHeader>

        <PopoverDescription>
          This is stage 5 of my experience. What do I imagine for myself in PostHog?
        </PopoverDescription>
      </InteractiveNode.Popover.Content>
    </InteractiveNode.Root>
  )
}
