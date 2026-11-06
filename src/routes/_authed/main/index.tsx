import { createFileRoute } from '@tanstack/solid-router'
import { Scenery } from './-scenery'
import * as Scene from '@/routes/_authed/-components/Scene'
import { preloadAssets } from '@/lib/utils'
import { onCleanup, onMount } from 'solid-js'

export const Route = createFileRoute('/_authed/main/')({
  staticData: { scene: 'main' },
  loader: ({ route }) => ({ links: preloadAssets(route.id) }),
  head: ({ loaderData }) => ({ links: loaderData!.links }),
  component() {
    console.log('MAIN render')
    onMount(() => console.log('MAIN mount'))
    onCleanup(() => console.log('MAIN cleanup'))
    return (
      <Scene.Root>
        <Scene.Background routeId="/_authed/main/" asset="main_v2.png" />
        <Scenery />
      </Scene.Root>
    )
  },
})
