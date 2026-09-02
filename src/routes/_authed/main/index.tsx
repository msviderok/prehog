import { createFileRoute } from '@tanstack/solid-router'
import { Experience, Intro, MyProjects, PersonalStuff, Temp1, Temp2, WhyAmIGoodForARole } from './-components'

export const Route = createFileRoute('/_authed/main/')({
  staticData: { scene: 'main' },
  component() {
    return (
      <>
        {/*<Intro />*/}
        <Experience />
        {/*<WhyAmIGoodForARole />
        <MyProjects />
        <PersonalStuff />
        <Temp1 />
        <Temp2 />*/}
      </>
    )
  },
})
