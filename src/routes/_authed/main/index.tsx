import { createFileRoute } from '@tanstack/solid-router'
import { Experience, Intro, MyProjects, PersonalStuff, Temp1, Temp2, WhyAmIGoodForARole } from './-components'
import * as Scene from '@/components/Scene'

export const Route = createFileRoute('/_authed/main/')({
  staticData: { scene: 'main' },
  component() {
    return (
      <Scene.Root>
        <Scene.Background routeId="/_authed/main/" asset="main.png" />
        <Scene.Elements>
          <Intro />
          <Experience />
          <WhyAmIGoodForARole />
          <MyProjects />
          <PersonalStuff />
          <Temp1 />
          <Temp2 />

          <Scene.Players />
        </Scene.Elements>
      </Scene.Root>
    )
  },
})
