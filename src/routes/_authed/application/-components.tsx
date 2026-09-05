import { Asset } from '@/components/Asset'
import {
  Popover,
  PopoverActionDoor,
  PopoverArrow,
  PopoverFooter,
  PopoverPopup,
  PopoverPortal,
  PopoverPositioner,
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
        anchorPosition: { x: 10, y: 70 },
        hitboxPosition: { x: 10, y: 94 },
      }}
    >
      <PopoverTrigger />
      <PopoverPortal>
        <PopoverPositioner side="top" align="start">
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

// export function AssetScaffoldWide() {
//   return <Asset routeId="/_authed/application/" asset="c_asset_wide.png" />
// }

export function AssetScaffoldHogDrill() {
  return (
    <Asset
      routeId="/_authed/application/"
      asset="hog_drill.png"
      scale={0.6}
      class="translate-y-[10%] translate-x-[10%]"
    />
  )
}
