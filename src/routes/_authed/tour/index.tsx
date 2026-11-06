import * as Scene from '@/routes/_authed/-components/Scene'
import { preloadAssets } from '@/lib/utils'
import { createFileRoute } from '@tanstack/solid-router'
import { Scenery } from './-scenery'
import { onCleanup, onMount } from 'solid-js'

export const Route = createFileRoute('/_authed/tour/')({
  staticData: { scene: 'tour' },
  loader: ({ route }) => ({ links: preloadAssets(route.id) }),
  head: ({ loaderData }) => ({ links: loaderData!.links }),
  component() {
    console.log('EXPERIENCE render')
    onMount(() => console.log('EXPERIENCE mount'))
    onCleanup(() => console.log('EXPERIENCE cleanup'))
    return (
      <Scene.Root>
        <Scenery />
      </Scene.Root>
    )
  },
})
