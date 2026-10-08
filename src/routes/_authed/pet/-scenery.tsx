import { api } from '@/convex/api'
import { useSingleFlightMutation } from '@/lib/useSingleFlightMutation'
import * as Scene from '@/routes/_authed/-components/Scene'
import * as InteractiveNode from '@/routes/_authed/-components/interactive-layer'

export function Scenery() {
  return (
    <Scene.Elements>
      <Door />
      <Scene.Players />
    </Scene.Elements>
  )
}

function Door() {
  const setScene = useSingleFlightMutation(api.gameState.setScene)
  return (
    <InteractiveNode.Root id="door">
      <InteractiveNode.Preload.Route route="main" />
      <InteractiveNode.Marker.Root x={2} y={91}>
        <InteractiveNode.Marker.Pill label="Go back" onInteract={() => setScene.mutate({ scene: 'main' })} />
      </InteractiveNode.Marker.Root>
    </InteractiveNode.Root>
  )
}
