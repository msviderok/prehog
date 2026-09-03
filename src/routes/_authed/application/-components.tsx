import {
  Popover,
  PopoverActionDoor,
  PopoverArrow,
  PopoverDescription,
  PopoverFooter,
  PopoverHeader,
  PopoverPopup,
  PopoverPortal,
  PopoverPositioner,
  PopoverTitle,
  PopoverTrigger,
} from '@/components/ui/popover'
import { api } from '@/convex/api'
import { useMutation } from 'convex-solidjs'

export function Door() {
  const setScene = useMutation(api.gameState.setScene)
  return (
    <Popover
      variant="scenery"
      sceneryProps={{
        anchorPosition: { x: 19.99, y: 48 },
        hitboxPosition: { x: 11, y: 94 },
      }}
    >
      <PopoverTrigger />
      <PopoverPortal>
        <PopoverPositioner side="top" align="end">
          <PopoverPopup>
            <PopoverArrow />

            <PopoverFooter>
              <PopoverActionDoor hotkey="E" onHotkeyPress={() => void setScene.mutate({ scene: 'main' })}>
                Go back
              </PopoverActionDoor>
            </PopoverFooter>
          </PopoverPopup>
        </PopoverPositioner>
      </PopoverPortal>
    </Popover>
  )
}
