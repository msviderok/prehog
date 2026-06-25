import { useGlobalState } from '@/components/GlobalStateContext'
import { ButtonGroup, ButtonGroupText, ButtonGroupWrapper } from '@/components/ui/button-group'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { api } from '@/convex/api'
import { useQuery } from 'convex-solidjs'
import { ChevronUpIcon, LoaderCircleIcon } from 'lucide-solid'
import { For, type ParentProps } from 'solid-js'

export function VideoButton(props: ParentProps<{ label: string; class?: string }>) {
  const { rtc } = useGlobalState()
  const { data: callStatus } = useQuery(api.activeCall.status, {})

  return (
    <ButtonGroupWrapper class={props.class}>
      <ButtonGroup>
        <DropdownMenu>
          <DropdownMenuTrigger
            variant="outline"
            size="icon"
            animate="scale-icon"
            class="h-10"
            disabled={rtc.videoPermissions() === 'denied'}
            onClick={async () => {
              await rtc.checkVideoPermissions()
            }}
          >
            {rtc.devices.loading ? <LoaderCircleIcon class="animate-spin" /> : <ChevronUpIcon />}
          </DropdownMenuTrigger>

          <DropdownMenuContent class="w-max" side="top" align="start">
            <DropdownMenuGroup>
              <DropdownMenuLabel>Video Device</DropdownMenuLabel>
              <DropdownMenuRadioGroup
                value={rtc.selectedVideoInputDevice().deviceId}
                onValueChange={async (value) => {
                  if (callStatus() == null) return

                  if (callStatus() === 'in-progress') {
                    await rtc.setDevice('videoinput', value)
                  } else {
                    await rtc.updateSelectedDeviceValue('videoinput', value)
                  }
                }}
              >
                <For each={rtc.devices.latest?.dropdown.videoinput ?? []}>
                  {(device) => <DropdownMenuRadioItem value={device.deviceId}>{device.label}</DropdownMenuRadioItem>}
                </For>
              </DropdownMenuRadioGroup>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        {props.children}
      </ButtonGroup>

      <ButtonGroupText>{props.label}</ButtonGroupText>
    </ButtonGroupWrapper>
  )
}
