import { Door } from '@/routes/_authed/-components/Door'
import * as Scene from '@/routes/_authed/-components/Scene'

export function Scenery() {
  return (
    <Scene.Elements>
      <Door to="main" position={{ x: 2, y: 91 }} />
      <Scene.Players />
    </Scene.Elements>
  )
}
