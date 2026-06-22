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
import { For, Show, type ParentProps } from 'solid-js'
import { useRtcContext } from './useRtcContext'
import { HAVE_AUDIO_OUTPUT_SELECTOR } from '@/lib/constants'

export function AudioButton(props: ParentProps<{ label: string; class?: string }>) {
  const { selectedDevices, setDevice, devices } = useRtcContext()
  return (
    <ButtonGroupWrapper class={props.class}>
      <ButtonGroup>
        <DropdownMenu>
          <DropdownMenuTrigger variant="outline" size="icon" animate="scale-icon" class="h-10">
            <ChevronUpIcon />
          </DropdownMenuTrigger>

          <DropdownMenuContent class="w-max" side="top" align="start">
            <DropdownMenuGroup>
              <DropdownMenuLabel>Input Device</DropdownMenuLabel>
              <DropdownMenuRadioGroup
                value={selectedDevices.audioinput ?? ''}
                onValueChange={(value) => setDevice('audioinput', value)}
              >
                <For each={devices.latest?.audioinput}>
                  {(device) => <DropdownMenuRadioItem value={device.deviceId}>{device.label}</DropdownMenuRadioItem>}
                </For>
              </DropdownMenuRadioGroup>
            </DropdownMenuGroup>

            <Show when={HAVE_AUDIO_OUTPUT_SELECTOR}>
              <>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuLabel>Output Device</DropdownMenuLabel>
                  <DropdownMenuRadioGroup
                    value={selectedDevices.audiooutput ?? ''}
                    onValueChange={(value) => setDevice('audiooutput', value)}
                  >
                    <For each={devices.latest?.audiooutput}>
                      {(device) => (
                        <DropdownMenuRadioItem value={device.deviceId}>{device.label}</DropdownMenuRadioItem>
                      )}
                    </For>
                  </DropdownMenuRadioGroup>
                </DropdownMenuGroup>
              </>
            </Show>
          </DropdownMenuContent>
        </DropdownMenu>

        {props.children}
      </ButtonGroup>

      <ButtonGroupText>{props.label}</ButtonGroupText>
    </ButtonGroupWrapper>
  )
}
