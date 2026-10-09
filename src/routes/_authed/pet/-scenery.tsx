import * as Scene from '@/routes/_authed/-components/Scene'
import * as InteractiveNode from '@/routes/_authed/-components/interactive-layer'

export function Scenery() {
  return (
    <Scene.Elements>
      <InteractiveNode.Root id="door">
        <InteractiveNode.Preload.Route route="main" />
        <InteractiveNode.Marker.Root x={2} y={91}>
          <InteractiveNode.Marker.Pill label="Go back" goTo="main" />
        </InteractiveNode.Marker.Root>
      </InteractiveNode.Root>

      <Scene.Players />
    </Scene.Elements>
  )
}
