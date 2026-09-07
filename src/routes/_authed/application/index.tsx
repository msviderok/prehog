import * as Scene from '@/components/Scene'
import { preloadAssets } from '@/lib/utils'
import { createFileRoute } from '@tanstack/solid-router'
import { Scenery } from './-components'

export const Route = createFileRoute('/_authed/application/')({
  component: RouteComponent,
  staticData: { scene: 'application' },
  head: ({ match }) => ({ links: preloadAssets(match.routeId) }),
})

function RouteComponent() {
  return (
    <Scene.Root>
      <Scene.Background routeId="/_authed/application/" asset="BG.png" />
      <Scenery />
    </Scene.Root>
  )
}
