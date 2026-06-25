import { useGlobalState } from '@/components/GlobalStateContext'
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
import { api } from '@/convex/api'
import { HAVE_AUDIO_OUTPUT_SELECTOR } from '@/lib/constants'
import { useQuery } from 'convex-solidjs'
import { ChevronUpIcon, LoaderCircleIcon } from 'lucide-solid'
import { For, Show, type ParentProps } from 'solid-js'

export function AudioButton(props: ParentProps<{ label: string; class?: string; disabled?: boolean }>) {
  const { rtc } = useGlobalState()
  const { data: callStatus } = useQuery(api.activeCall.status, {})

  return (
    <ButtonGroupWrapper class={props.class}>
      <ButtonGroup>
        <DropdownMenu>
          <DropdownMenuTrigger
            size="icon"
            variant="outline"
            animate="scale-icon"
            class="h-10 aria-expanded:[&_svg]:rotate-z-180"
            disabled={rtc.audioPermissions() === 'denied'}
            onClick={async () => {
              await rtc.checkAudioPermissions()
            }}
          >
            {rtc.devices.loading ? <LoaderCircleIcon class="animate-spin" /> : <ChevronUpIcon />}
          </DropdownMenuTrigger>

          <DropdownMenuContent class="w-max" side="top" align="start">
            <DropdownMenuGroup>
              <DropdownMenuLabel>Input Device</DropdownMenuLabel>
              <DropdownMenuRadioGroup
                value={rtc.selectedAudioInputDevice().deviceId}
                onValueChange={async (value) => {
                  if (callStatus() == null) return

                  if (callStatus() === 'in-progress') {
                    await rtc.setDevice('audioinput', value)
                  } else {
                    await rtc.updateSelectedDeviceValue('audioinput', value)
                  }
                }}
              >
                <For each={rtc.devices.latest?.dropdown?.audioinput}>
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
                    value={rtc.selectedAudioOutputDevice().deviceId}
                    onValueChange={async (value) => {
                      if (callStatus() == null) return

                      if (callStatus() === 'in-progress') {
                        await rtc.setDevice('audiooutput', value)
                      } else {
                        await rtc.updateSelectedDeviceValue('audiooutput', value)
                      }
                    }}
                  >
                    <For each={rtc.devices.latest?.dropdown.audiooutput}>
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
