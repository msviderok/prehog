import { api } from '@/convex/api'
import { useSingleFlightMutation } from '@/lib/useSingleFlightMutation'
import * as Scene from '@/routes/_authed/-components/Scene'
import { SceneryPopover } from '../-components/SceneryPopover'

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
    <SceneryPopover
      id="door"
      side="top"
      align="center"
      marker={{
        position: { x: 2, y: 91 },
        preloadRoute: 'main',
        onInteract: () => setScene.mutate({ scene: 'main' }),
        label: 'Go back',
      }}
    />
  )
}
