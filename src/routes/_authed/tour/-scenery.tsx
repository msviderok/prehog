import { PopoverDescription, PopoverHeader, PopoverTitle } from '@/components/ui/popover'
import * as Scene from '@/routes/_authed/-components/Scene'
import { SceneryPopover } from '../-components/SceneryPopover'
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
    <SceneryPopover
      id="door"
      side="top"
      align="center"
      marker={{
        position: { x: 3, y: 96 },
        preloadRoute: 'main',
        onInteract: () => setScene.mutate({ scene: 'main' }),
        label: 'Go back',
      }}
    />
  )
}

export function Stage1() {
  return (
    <SceneryPopover
      id="stage1"
      anchor={{ position: { x: 12.3, y: 71.5 } }}
      marker={{ position: { x: 12.3, y: 96 } }}
      side="top"
      align="center"
    >
      <PopoverHeader>
        <PopoverTitle>Stage 1</PopoverTitle>
      </PopoverHeader>

      <PopoverDescription>
        This is stage 1 of my experience. I should start with my PHP, React, RoR and all that stuff in Yedynka and
        PettersonApps. ALSO ELM MENTIONED SHOULD BE.
      </PopoverDescription>
    </SceneryPopover>
  )
}

export function Stage2() {
  return (
    <SceneryPopover
      id="stage2"
      anchor={{ position: { x: 30.3, y: 71.5 } }}
      marker={{ position: { x: 30.3, y: 96 } }}
      side="top"
      align="center"
    >
      <PopoverHeader>
        <PopoverTitle>Stage 2</PopoverTitle>
      </PopoverHeader>

      <PopoverDescription>
        This is stage 2 of my experience. Probably should tell smth about my post-PettersonApps era.
      </PopoverDescription>
    </SceneryPopover>
  )
}

export function Stage3() {
  return (
    <SceneryPopover
      id="stage3"
      anchor={{ position: { x: 49.7, y: 71.5 } }}
      marker={{ position: { x: 49.7, y: 96 } }}
      side="top"
      align="center"
    >
      <PopoverHeader>
        <PopoverTitle>Stage 3</PopoverTitle>
      </PopoverHeader>

      <PopoverDescription>
        This is stage 3 of my experience. The whole OverlayAnalytics journey begins...
      </PopoverDescription>
    </SceneryPopover>
  )
}

export function Stage4() {
  return (
    <SceneryPopover
      id="stage4"
      anchor={{ position: { x: 69.6, y: 71.5 } }}
      marker={{ position: { x: 69.6, y: 96 } }}
      side="top"
      align="center"
    >
      <PopoverHeader>
        <PopoverTitle>Stage 4</PopoverTitle>
      </PopoverHeader>

      <PopoverDescription>
        This is stage 4 of my experience. Valora and everything afterwards like Base UI should be described here.
      </PopoverDescription>
    </SceneryPopover>
  )
}

export function Stage5() {
  return (
    <SceneryPopover
      id="stage5"
      anchor={{ position: { x: 89.6, y: 71.5 } }}
      marker={{ position: { x: 89.6, y: 96 } }}
      side="top"
      align="center"
    >
      <PopoverHeader>
        <PopoverTitle>Stage 5</PopoverTitle>
      </PopoverHeader>

      <PopoverDescription>
        This is stage 5 of my experience. What do I imagine for myself in PostHog?
      </PopoverDescription>
    </SceneryPopover>
  )
}
