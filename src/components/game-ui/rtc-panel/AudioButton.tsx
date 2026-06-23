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
import { HAVE_AUDIO_OUTPUT_SELECTOR } from '@/lib/constants'
import { ChevronUpIcon, LoaderCircleIcon } from 'lucide-solid'
import { For, Show, type ParentProps } from 'solid-js'
import { useRtcContext } from './useRtcContext'

export function AudioButton(props: ParentProps<{ label: string; class?: string; disabled?: boolean }>) {
  const ctx = useRtcContext()

  return (
    <ButtonGroupWrapper class={props.class}>
      <ButtonGroup>
        <DropdownMenu>
          <DropdownMenuTrigger
            size="icon"
            variant="outline"
            animate="scale-icon"
            class="h-10 aria-expanded:[&_svg]:rotate-z-180"
            disabled={ctx.rtc.audioPermissions() === 'denied'}
            onClick={async () => {
              await ctx.rtc.checkAudioPermissions()
            }}
          >
            {ctx.rtc.devices.loading ? <LoaderCircleIcon class="animate-spin" /> : <ChevronUpIcon />}
          </DropdownMenuTrigger>

          <DropdownMenuContent class="w-max" side="top" align="start">
            <DropdownMenuGroup>
              <DropdownMenuLabel>Input Device</DropdownMenuLabel>
              <DropdownMenuRadioGroup
                value={ctx.rtc.selectedAudioInputDevice().deviceId}
                onValueChange={async (value) => {
                  if (ctx.callStatus === 'in-progress') {
                    await ctx.rtc.setDevice('audioinput', value)
                  } else {
                    await ctx.rtc.updateSelectedDeviceValue('audioinput', value)
                  }
                }}
              >
                <For each={ctx.rtc.devices.latest?.dropdown?.audioinput}>
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
                    value={ctx.rtc.selectedAudioOutputDevice().deviceId}
                    onValueChange={async (value) => {
                      if (ctx.callStatus === 'in-progress') {
                        await ctx.rtc.setDevice('audiooutput', value)
                      } else {
                        await ctx.rtc.updateSelectedDeviceValue('audiooutput', value)
                      }
                    }}
                  >
                    <For each={ctx.rtc.devices.latest?.dropdown.audiooutput}>
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
