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
import { ChevronUpIcon } from 'lucide-solid'
import { For, type ParentProps } from 'solid-js'
import { useRtcContext } from './useRtcContext'

export function VideoButton(props: ParentProps<{ label: string; class?: string }>) {
  const { myRTC, devices, setDevice } = useRtcContext()
  return (
    <ButtonGroupWrapper class={props.class}>
      <ButtonGroup>
        <DropdownMenu>
          <DropdownMenuTrigger variant="outline" size="icon" animate="scale-icon" class="h-10">
            <ChevronUpIcon />
          </DropdownMenuTrigger>

          <DropdownMenuContent class="w-max" side="top" align="start">
            <DropdownMenuGroup>
              <DropdownMenuLabel>Video Device</DropdownMenuLabel>
              <DropdownMenuRadioGroup
                value={myRTC.selectedDevices.videoinput ?? ''}
                onValueChange={(value) => setDevice('videoinput', value)}
              >
                <For each={devices.latest?.videoinput}>
                  {(device) => (
                    <DropdownMenuRadioItem value={device.device.deviceId}>{device.device.label}</DropdownMenuRadioItem>
                  )}
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
