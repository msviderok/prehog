import { Howl } from 'howler'
import accept from './files/accept.m4a'
import call from './files/call.m4a'
import cancel from './files/cancel.webm'
import dial from './files/dial.m4a'
import end from './files/end.m4a'
import fire from './files/fire.webm'
import footstepsConcrete from './files/foley_footstep_concrete.webm'
import footstepsWood from './files/foley_footstep_carpet_sprite.webm'
import footstepsFloor from './files/footsteps_floor.webm'
import footstepsStone from './files/footsteps_stone.webm'
import oblivion_npc_piano from './files/oblpiano.mp3'
import pop3 from './files/pop_3.webm'
import reject from './files/reject.m4a'
import toggleOn from './files/toggle_on.webm'
import dramaticMusic from './files/dramatic_music.webm'

const VOLUME = 1

export type SoundsUI = keyof typeof SOUNDS.ui
export type SoundsUIType = {
  [K in keyof typeof SOUNDS.ui]: (typeof SOUNDS.ui)[K] & { _sprite: string[] }
}

export const SOUNDS = {
  dial: new Howl({ src: dial, loop: true, volume: VOLUME }),
  call: new Howl({ src: call, loop: true, volume: VOLUME }),
  end: new Howl({ src: end, loop: false, volume: VOLUME }),
  reject: new Howl({ src: reject, loop: false, volume: VOLUME }),
  accept: new Howl({ src: accept, loop: false, volume: VOLUME }),
  music: {
    oblivion_npc_piano: new Howl({ src: oblivion_npc_piano, loop: true, volume: VOLUME }),
    dramatic: new Howl({ src: dramaticMusic, loop: false, volume: VOLUME }),
  },
  footsteps: {
    concrete: new Howl({ src: footstepsConcrete, loop: true, volume: 0.5 }),
    wood: new Howl({ src: footstepsWood, loop: true, volume: 0.5, rate: 2 }),
    floor: new Howl({ src: footstepsFloor, loop: true, volume: 0.5, rate: 0.2 }),
    stone: new Howl({ src: footstepsStone, loop: true, volume: 0.5, rate: 0.8 }),
  },
  effects: {
    // fire: new Howl({ src: fire, loop: true, volume: VOLUME * 0.1, rate: 1 }),
    fire: new Howl({ src: fire, loop: true, volume: VOLUME * 0, rate: 1 }),
    markerEnter: new Howl({ src: pop3, volume: VOLUME * 0.2, rate: 0.5, mute: true }),
    markerLeave: new Howl({ src: pop3, volume: VOLUME * 0.2, rate: 0.3, mute: true }),
  },
  ui: {
    cancel: new Howl({ src: cancel, volume: VOLUME, rate: 1 }),
    keydown: new Howl({ src: toggleOn, volume: VOLUME * 0.3, rate: 1.5, sprite: { default: [100, 200] } }),
    keyup: new Howl({ src: toggleOn, volume: VOLUME * 0.3, rate: 1, sprite: { default: [150, 300] } }),
    carouselChangeSlideHorizontal: new Howl({ src: cancel, volume: VOLUME * 0.7, rate: 4 }),
    carouselChangeSlideVertical: new Howl({ src: cancel, volume: VOLUME * 0.7, rate: 3 }),
  },
} as const
