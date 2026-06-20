import call from '@/assets/sounds/call.m4a'
import dial from '@/assets/sounds/dial.m4a'
import end from '@/assets/sounds/end.m4a'
import reject from '@/assets/sounds/reject.m4a'
import accept from '@/assets/sounds/accept.m4a'
import { Howl } from 'howler'

const VOLUME = 0

export const SOUNDS = {
  dial: new Howl({ src: dial, loop: true, volume: VOLUME }),
  call: new Howl({ src: call, loop: true, volume: VOLUME }),
  end: new Howl({ src: end, loop: false, volume: VOLUME }),
  reject: new Howl({ src: reject, loop: false, volume: VOLUME }),
  accept: new Howl({ src: accept, loop: false, volume: VOLUME }),
} as const

SOUNDS.dial.stereo(-1.0)
SOUNDS.call.stereo(1.0)
