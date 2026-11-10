import { preloadAssets } from '@/lib/utils'
import * as Scene from '@/routes/_authed/-components/Scene'
import { createFileRoute } from '@tanstack/solid-router'
import { Scenery } from './-scenery'

export const Route = createFileRoute('/_authed/tour/')({
  staticData: { scene: 'tour' },
  loader: ({ route }) => ({ links: preloadAssets(route.id) }),
  head: ({ loaderData }) => ({ links: loaderData!.links }),
  component() {
    return (
      <Scene.Root>
        <Scenery />
      </Scene.Root>
    )
  },
})
