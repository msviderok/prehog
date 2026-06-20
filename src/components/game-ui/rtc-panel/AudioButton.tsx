import { ButtonGroup, ButtonGroupText, ButtonGroupWrapper } from '@/components/ui/button-group'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ChevronUpIcon } from 'lucide-solid'
import { For, type ParentProps } from 'solid-js'
import { useRtcContext } from './useRtcContext'

export function AudioButton(props: ParentProps<{ label: string; class?: string }>) {
  const { myRTC, refetchDevices, setDevice, devices } = useRtcContext()
  return (
    <ButtonGroupWrapper class={props.class}>
      <ButtonGroup>
        <DropdownMenu>
          <DropdownMenuTrigger
            variant="outline"
            size="icon"
            animate="scale-icon"
            class="h-10"
            onClick={() => refetchDevices('audio')}
          >
            <ChevronUpIcon />
          </DropdownMenuTrigger>

          <DropdownMenuContent class="w-max" side="top" align="start">
            <DropdownMenuGroup>
              <DropdownMenuLabel>Input Device</DropdownMenuLabel>
              <DropdownMenuRadioGroup
                value={myRTC.selectedDevices.audioinput ?? ''}
                onValueChange={(value) => setDevice('audioinput', value)}
              >
                <For each={devices.latest?.audioinput}>
                  {(device) => (
                    <DropdownMenuRadioItem value={device.device.deviceId}>{device.device.label}</DropdownMenuRadioItem>
                  )}
                </For>
              </DropdownMenuRadioGroup>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            <DropdownMenuGroup>
              <DropdownMenuLabel>Output Device</DropdownMenuLabel>
              <DropdownMenuRadioGroup
                value={myRTC.selectedDevices.audiooutput ?? ''}
                onValueChange={(value) => setDevice('audiooutput', value)}
              >
                <For each={devices.latest?.audiooutput}>
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
