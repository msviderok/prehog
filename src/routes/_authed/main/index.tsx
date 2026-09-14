import { createFileRoute } from '@tanstack/solid-router'
import { Scenery } from './-scenery'
import * as Scene from '@/routes/_authed/-components/Scene'
import { preloadAssets } from '@/lib/utils'

export const Route = createFileRoute('/_authed/main/')({
  staticData: { scene: 'main' },
  loader: ({ route }) => ({ links: preloadAssets(route.id) }),
  head: ({ loaderData }) => ({ links: loaderData!.links }),
  component() {
    return (
      <Scene.Root>
        <Scene.Background routeId="/_authed/main/" asset="main_empty.png" />
        <Scenery />
      </Scene.Root>
    )
  },
})
