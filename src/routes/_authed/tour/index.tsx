import { createFileRoute } from '@tanstack/solid-router'
import { DoorPopover, Stage1, Stage2, Stage3, Stage4, Stage5 } from './-components'
import * as Scene from '@/components/Scene'
import { preloadAssets } from '@/lib/utils'

export const Route = createFileRoute('/_authed/tour/')({
  staticData: { scene: 'tour' },
  loader: ({ route }) => ({ links: preloadAssets(route.id) }),
  head: ({ loaderData }) => ({ links: loaderData!.links }),
  component() {
    return (
      <Scene.Root>
        <Scene.Background routeId="/_authed/tour/" asset="evolution.png" />
        <Scene.Elements>
          <Scene.Players />

          <DoorPopover />
          <Stage1 />
          <Stage2 />
          <Stage3 />
          <Stage4 />
          <Stage5 />
        </Scene.Elements>
      </Scene.Root>
    )
  },
})
