import * as Scene from '@/routes/_authed/-components/Scene'
import { preloadAssets } from '@/lib/utils'
import { createFileRoute } from '@tanstack/solid-router'
import { Scenery } from './-scenery'

export const Route = createFileRoute('/_authed/application/')({
  staticData: { scene: 'application' },
  loader: ({ route }) => ({ links: preloadAssets(route.id) }),
  head: ({ loaderData }) => ({ links: loaderData!.links }),
  component() {
    return (
      <Scene.Root>
        <Scene.Background routeId="/_authed/application/" asset="BG.png" />
        <Scenery />
      </Scene.Root>
    )
  },
})
