import { getLSKey } from '@/lib/utils'
import { makePersisted } from '@solid-primitives/storage'
import { createEffect, createMemo, createResource, on, onMount } from 'solid-js'
import { createStore } from 'solid-js/store'
import * as v from 'valibot'

const SELECTED_LS_KEY = getLSKey('selected-media-devices')

const MediaDeviceKindSchema: v.GenericSchema<MediaDeviceKind> = v.picklist(['audioinput', 'audiooutput', 'videoinput'])
const MediaDeviceInfoSchema: v.GenericSchema<Omit<MediaDeviceInfo, 'toJSON'>> = v.looseObject({
  deviceId: v.string(),
  groupId: v.string(),
  kind: MediaDeviceKindSchema,
  label: v.string(),
})
const StoredMediaDeviceInfoSchema = v.record(MediaDeviceKindSchema, v.optional(MediaDeviceInfoSchema))

type SelectedDevices = Record<MediaDeviceInfo['kind'], MediaDeviceInfo | undefined>
type GroupedDevices = Record<MediaDeviceInfo['kind'], MediaDeviceInfo[]>

interface State {
  all: MediaDeviceInfo[]
  dropdown: GroupedDevices
}

export function createMediaDevices() {
  const [selectedDevices, _setSelectedDevices] = createStore<SelectedDevices>({
    audioinput: undefined,
    audiooutput: undefined,
    videoinput: undefined,
  })

  const [devices, { refetch: refetchDevices }] = createResource<State>(
    async () => {
      const devices = await navigator.mediaDevices.enumerateDevices()
      return devices.reduce(
        (acc, device) => {
          acc.all.push(device)
          if (device.deviceId === 'default' || device.label.startsWith('Default - ')) return acc
          acc.dropdown[device.kind].push(device)
          return acc
        },
        { all: [], dropdown: { audioinput: [], audiooutput: [], videoinput: [] } } as State,
      )
    },
    {
      initialValue: {
        all: [],
        dropdown: { audioinput: [], audiooutput: [], videoinput: [] },
      } as State,
    },
  )

  const selectedAudioInputValue = createMemo(() => selectedDevices?.audioinput?.deviceId ?? '')
  const selectedAudioOutputValue = createMemo(() => selectedDevices?.audiooutput?.deviceId ?? '')
  const selectedVideoInputValue = createMemo(() => selectedDevices?.videoinput?.deviceId ?? '')

  createEffect(
    on(
      () => devices.state === 'ready',
      (isReady) => isReady && fixSelectedDevices(),
    ),
  )

  /** @throws */
  function fixSelectedDevices() {
    try {
      const storedDevicesLSData = localStorage.getItem(SELECTED_LS_KEY)
      const storedDevices = v.parse(StoredMediaDeviceInfoSchema, JSON.parse(storedDevicesLSData ?? '{}'))

      console.log({ storedDevices })
      for (const kind of ['audioinput', 'audiooutput', 'videoinput'] as MediaDeviceKind[]) {
        const stored = storedDevices[kind]
        const dropdownList = devices().dropdown[kind]

        console.log({ kind, stored, dropdownList })
        if (dropdownList.length === 0) {
          throw new Error(`No ${kind} devices available`)
        }

        console.log(1)
        if (stored == null) {
          setSelectedDevices(kind, dropdownList[0]!)
          continue
        }

        console.log(2)
        const existingDeviceIsDefault = stored.deviceId === 'default' || stored.label.startsWith('Default - ')
        console.log({ existingDeviceIsDefault })
        if (existingDeviceIsDefault) {
          console.log(3)
          const normalizedLabel = stored.label.replace('Default - ', '')
          const actualDevice = devices().all.find((d) => d.kind === kind && d.label === normalizedLabel)
          setSelectedDevices(kind, actualDevice ?? dropdownList[0] ?? ({ deviceId: '' } as MediaDeviceInfo))
          continue
        }

        const existingDeviceById = devices().all.find((d) => d.kind === kind && d.deviceId === stored.deviceId)
        console.log(4)
        if (existingDeviceById) {
          setSelectedDevices(kind, existingDeviceById)
          continue
        }

        console.log(5)
        const existingDeviceByLabel = devices().all.find((d) => d.kind === kind && d.label === stored.label)
        if (existingDeviceByLabel) {
          setSelectedDevices(kind, existingDeviceByLabel)
          continue
        }

        console.log(6)
        const browserDefaultDevice = devices().all.find(
          (d) => d.kind === kind && (d.deviceId === 'default' || d.label.startsWith('Default - ')),
        )
        const normalizedLabel = browserDefaultDevice?.label.replace('Default - ', '')
        const actualDevice = devices().all.find((d) => d.kind === kind && d.label === normalizedLabel)

        console.log(7)
        if (actualDevice) {
          console.log(8)
          setSelectedDevices(kind, actualDevice)
          continue
        }

        console.log(9)
        if (dropdownList.length === 0) {
          throw new Error(`No ${kind} devices available`)
        }

        console.log(10)
        setSelectedDevices(kind, dropdownList[0]!)
      }
    } catch (error) {
      console.warn("Couldn't parse selected devices from the local storage", { error })
    }
  }

  function setSelectedDevices(kind: MediaDeviceKind, device: MediaDeviceInfo) {
    _setSelectedDevices(kind, device)
    localStorage.setItem(SELECTED_LS_KEY, JSON.stringify({ ...selectedDevices, [kind]: device }))
  }

  return {
    devices,
    refetchDevices,
    selectedDevices,
    setSelectedDevices,
    selectedAudioInputValue,
    selectedAudioOutputValue,
    selectedVideoInputValue,
  }
}
