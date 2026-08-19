import { createFileRoute } from '@tanstack/solid-router'
import { DoorPopover, Stage1, Stage2, Stage3, Stage4, Stage5 } from './-tour.components'

export const Route = createFileRoute('/_authed/tour')({
  staticData: { scene: 'tour' },
  component() {
    return (
      <>
        <DoorPopover />
        <Stage1 />
        <Stage2 />
        <Stage3 />
        <Stage4 />
        <Stage5 />
      </>
    )
  },
})
