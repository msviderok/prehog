import { getLSKey } from '@/lib/utils'
import { createEffect, createMemo, createResource, on } from 'solid-js'
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

  const [audioPermissions, audioAction] = createResource(async () => {
    if (!navigator.permissions.query) {
      console.warn('Navigator permissions not supported')
      return 'unknown'
    }

    try {
      const status = await navigator.permissions.query({ name: 'microphone' })
      status.onchange = async (e) => {
        audioAction.mutate((e.target as PermissionStatus).state)
        await refetchDevices()
      }
      return status.state
    } catch {
      console.warn('Failed to query microphone permission')
      return 'unknown'
    }
  })
  const [videoPermissions, videoAction] = createResource(async () => {
    if (!navigator.permissions.query) {
      console.warn('Navigator permissions not supported')
      return 'unknown'
    }

    try {
      const status = await navigator.permissions.query({ name: 'camera' })
      status.onchange = async (e) => {
        videoAction.mutate((e.target as PermissionStatus).state)
        await refetchDevices()
      }
      return status.state
    } catch {
      console.warn('Failed to query camera permission')
      return 'unknown'
    }
  })

  const selectedAudioInputValue = createMemo(() => selectedDevices?.audioinput?.deviceId ?? '')
  const selectedAudioOutputValue = createMemo(() => selectedDevices?.audiooutput?.deviceId ?? '')
  const selectedVideoInputValue = createMemo(() => selectedDevices?.videoinput?.deviceId ?? '')

  const hasEmptyAudioDevices = createMemo(() =>
    devices()
      .all.filter((d) => d.kind === 'audioinput' || d.kind === 'audiooutput')
      .some((d) => d.deviceId === '' || d.label === ''),
  )
  const hasAudioPermissions = createMemo(() => audioPermissions() === 'granted' && hasEmptyAudioDevices() === false)
  const showManualAudioPermissionsWarning = createMemo(
    () => audioPermissions() === 'denied' || (audioPermissions() === 'granted' && hasEmptyAudioDevices()),
  )
  const needToCheckAudioPermissions = createMemo(
    () =>
      audioPermissions() === 'prompt' ||
      audioPermissions() === 'unknown' ||
      (audioPermissions() === 'granted' && hasEmptyAudioDevices()),
  )

  const hasEmptyVideoDevices = createMemo(() =>
    devices()
      .all.filter((d) => d.kind === 'videoinput')
      .some((d) => d.deviceId === '' || d.label === ''),
  )
  const hasVideoPermissions = createMemo(() => videoPermissions() === 'granted' && hasEmptyVideoDevices() === false)
  const showManualVideoPermissionsWarning = createMemo(
    () => videoPermissions() === 'denied' || (videoPermissions() === 'granted' && hasEmptyVideoDevices()),
  )
  const needToCheckVideoPermissions = createMemo(
    () =>
      videoPermissions() === 'prompt' ||
      videoPermissions() === 'unknown' ||
      (videoPermissions() === 'granted' && hasEmptyVideoDevices()),
  )

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

      for (const kind of ['audioinput', 'audiooutput', 'videoinput'] as MediaDeviceKind[]) {
        const stored = storedDevices[kind]
        const dropdownList = devices().dropdown[kind]

        if (dropdownList.length === 0) {
          throw new Error(`No ${kind} devices available`)
        }

        if (stored == null) {
          setSelectedDevices(kind, dropdownList[0]!)
          continue
        }

        const existingDeviceIsDefault = stored.deviceId === 'default' || stored.label.startsWith('Default - ')
        if (existingDeviceIsDefault) {
          const normalizedLabel = stored.label.replace('Default - ', '')
          const actualDevice = devices().all.find((d) => d.kind === kind && d.label === normalizedLabel)
          setSelectedDevices(kind, actualDevice ?? dropdownList[0] ?? ({ deviceId: '' } as MediaDeviceInfo))
          continue
        }

        const existingDeviceById = devices().all.find((d) => d.kind === kind && d.deviceId === stored.deviceId)
        if (existingDeviceById) {
          setSelectedDevices(kind, existingDeviceById)
          continue
        }

        const existingDeviceByLabel = devices().all.find((d) => d.kind === kind && d.label === stored.label)
        if (existingDeviceByLabel) {
          setSelectedDevices(kind, existingDeviceByLabel)
          continue
        }

        const browserDefaultDevice = devices().all.find(
          (d) => d.kind === kind && (d.deviceId === 'default' || d.label.startsWith('Default - ')),
        )
        const normalizedLabel = browserDefaultDevice?.label.replace('Default - ', '')
        const actualDevice = devices().all.find((d) => d.kind === kind && d.label === normalizedLabel)

        if (actualDevice) {
          setSelectedDevices(kind, actualDevice)
          continue
        }

        if (dropdownList.length === 0) {
          throw new Error(`No ${kind} devices available`)
        }

        setSelectedDevices(kind, dropdownList[0]!)
      }
    } catch (error) {
      console.warn("Couldn't parse selected devices from the local storage", { error })
    }
  }

  function setSelectedDevices(kind: MediaDeviceKind, device: MediaDeviceInfo) {
    _setSelectedDevices(kind, device)
    const realDevicesOrUndefined = Object.entries({ ...selectedDevices, [kind]: device }).reduce(
      (acc, [deviceKind, d]) => {
        acc[deviceKind as MediaDeviceKind] = d == null || d.deviceId === '' || d.label === '' ? undefined : d
        return acc
      },
      {} as Record<MediaDeviceKind, MediaDeviceInfo | undefined>,
    )
    localStorage.setItem(SELECTED_LS_KEY, JSON.stringify(realDevicesOrUndefined))
  }

  return {
    devices,
    refetchDevices,
    hasEmptyAudioDevices,
    hasEmptyVideoDevices,
    selectedDevices,
    setSelectedDevices,
    selectedAudioInputValue,
    selectedAudioOutputValue,
    selectedVideoInputValue,
    audioPermissions,
    videoPermissions,
    hasAudioPermissions,
    hasVideoPermissions,
    needToCheckAudioPermissions,
    needToCheckVideoPermissions,
    showManualAudioPermissionsWarning,
    showManualVideoPermissionsWarning,
    audioAction,
    videoAction,
  }
}
