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
import { ChevronUpIcon, LoaderCircleIcon } from 'lucide-solid'
import { For, type ParentProps } from 'solid-js'
import { useRtcContext } from './useRtcContext'

export function VideoButton(props: ParentProps<{ label: string; class?: string }>) {
  const ctx = useRtcContext()

  return (
    <ButtonGroupWrapper class={props.class}>
      <ButtonGroup>
        <DropdownMenu>
          <DropdownMenuTrigger
            variant="outline"
            size="icon"
            animate="scale-icon"
            class="h-10"
            disabled={ctx.rtc.videoPermissions() === 'denied'}
            onClick={async () => {
              await ctx.rtc.checkVideoPermissions()
            }}
          >
            {ctx.rtc.devices.loading ? <LoaderCircleIcon class="animate-spin" /> : <ChevronUpIcon />}
          </DropdownMenuTrigger>

          <DropdownMenuContent class="w-max" side="top" align="start">
            <DropdownMenuGroup>
              <DropdownMenuLabel>Video Device</DropdownMenuLabel>
              <DropdownMenuRadioGroup
                value={ctx.rtc.selectedVideoInputDevice().deviceId}
                onValueChange={async (value) => {
                  if (ctx.callStatus === 'in-progress') {
                    await ctx.rtc.setDevice('videoinput', value)
                  } else {
                    await ctx.rtc.updateSelectedDeviceValue('videoinput', value)
                  }
                }}
              >
                <For each={ctx.rtc.devices.latest?.dropdown.videoinput ?? []}>
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
