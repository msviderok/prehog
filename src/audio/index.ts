import {
  type AudioPatch,
  type PlayOptions,
  type SoundDefinition,
  type SoundPatch,
  type VoiceHandle,
  definePatch,
} from '@web-kits/audio'
import { Howl, Howler } from 'howler'
import accept from './files/accept.m4a'
import call from './files/call.m4a'
import dial from './files/dial.m4a'
import end from './files/end.m4a'
import reject from './files/reject.m4a'
import oblivion_npc_piano from './files/oblpiano.mp3'
import footstepsConcrete from './files/foley_footstep_concrete.webm'
import fire from './files/fire.webm'

const VOLUME = 1

export const SOUNDS = {
  dial: new Howl({ src: dial, loop: true, volume: VOLUME }),
  call: new Howl({ src: call, loop: true, volume: VOLUME }),
  end: new Howl({ src: end, loop: false, volume: VOLUME }),
  reject: new Howl({ src: reject, loop: false, volume: VOLUME }),
  accept: new Howl({ src: accept, loop: false, volume: VOLUME }),
  music: {
    oblivion_npc_piano: new Howl({ src: oblivion_npc_piano, loop: true, volume: VOLUME }),
  },
  footsteps: {
    concrete: new Howl({ src: footstepsConcrete, loop: true, volume: 0.5 }),
  },
  effects: {
    fire: new Howl({ src: fire, loop: true, volume: 0.1, rate: 1 }),
  },
} as const

const minimalPatch = {
  name: 'Minimal',
  author: 'Raphael Salaja',
  version: '1.0.0',
  description:
    'An ultra-clean sine-based palette for quiet, transparent UI feedback, made for products that prioritize subtlety, restraint, and smooth interaction cues over expressive flourish.',
  sounds: {
    tap: {
      source: { type: 'sine', frequency: 1200 },
      envelope: { attack: 0, decay: 0.012, sustain: 0, release: 0.004 },
      gain: 0.08,
    },
    click: {
      source: { type: 'sine', frequency: 800 },
      envelope: { attack: 0, decay: 0.015, sustain: 0, release: 0.005 },
      gain: 0.1,
    },
    'key-press': {
      source: { type: 'sine', frequency: 1100 },
      envelope: { attack: 0, decay: 0.01, sustain: 0, release: 0.003 },
      gain: 0.06,
    },
    'toggle-on': {
      layers: [
        {
          source: { type: 'sine', frequency: 880 },
          envelope: { attack: 0, decay: 0.02, sustain: 0, release: 0.006 },
          gain: 0.08,
        },
        {
          source: { type: 'sine', frequency: 1320 },
          envelope: { attack: 0, decay: 0.02, sustain: 0, release: 0.006 },
          delay: 0.03,
          gain: 0.07,
        },
      ],
    },
    'toggle-off': {
      layers: [
        {
          source: { type: 'sine', frequency: 1320 },
          envelope: { attack: 0, decay: 0.02, sustain: 0, release: 0.006 },
          gain: 0.08,
        },
        {
          source: { type: 'sine', frequency: 880 },
          envelope: { attack: 0, decay: 0.02, sustain: 0, release: 0.006 },
          delay: 0.03,
          gain: 0.07,
        },
      ],
    },
    checkbox: {
      source: { type: 'sine', frequency: 1000 },
      envelope: { attack: 0, decay: 0.018, sustain: 0, release: 0.005 },
      gain: 0.09,
    },
    select: {
      source: { type: 'sine', frequency: 1100 },
      envelope: { attack: 0, decay: 0.02, sustain: 0, release: 0.006 },
      gain: 0.08,
    },
    deselect: {
      source: { type: 'sine', frequency: 900 },
      envelope: { attack: 0, decay: 0.018, sustain: 0, release: 0.005 },
      gain: 0.06,
    },
    hover: {
      source: { type: 'sine', frequency: 500 },
      envelope: {
        attack: 0.05,
        decay: 0.05,
        sustain: 0,
        release: 0,
      },
      gain: 0.02,
    },
    'tab-switch': {
      source: { type: 'sine', frequency: 1050 },
      envelope: { attack: 0, decay: 0.015, sustain: 0, release: 0.005 },
      gain: 0.07,
    },
    expand: {
      source: { type: 'sine', frequency: { start: 800, end: 1000 } },
      envelope: { attack: 0, decay: 0.04, sustain: 0, release: 0.012 },
      gain: 0.06,
    },
    collapse: {
      source: { type: 'sine', frequency: { start: 1000, end: 800 } },
      envelope: { attack: 0, decay: 0.04, sustain: 0, release: 0.012 },
      gain: 0.06,
    },
    'page-enter': {
      source: { type: 'sine', frequency: { start: 700, end: 900 } },
      envelope: { attack: 0.003, decay: 0.04, sustain: 0, release: 0.015 },
      gain: 0.05,
    },
    'page-exit': {
      source: { type: 'sine', frequency: { start: 900, end: 700 } },
      envelope: { attack: 0, decay: 0.04, sustain: 0, release: 0.015 },
      gain: 0.04,
    },
    success: {
      layers: [
        {
          source: { type: 'sine', frequency: 523 },
          envelope: { attack: 0, decay: 0.05, sustain: 0, release: 0.015 },
          gain: 0.1,
        },
        {
          source: { type: 'sine', frequency: 784 },
          envelope: { attack: 0, decay: 0.05, sustain: 0, release: 0.015 },
          delay: 0.06,
          gain: 0.08,
        },
      ],
    },
    error: {
      layers: [
        {
          source: { type: 'sine', frequency: 300 },
          envelope: { attack: 0, decay: 0.04, sustain: 0, release: 0.012 },
          gain: 0.12,
        },
        {
          source: { type: 'sine', frequency: 280 },
          envelope: { attack: 0, decay: 0.04, sustain: 0, release: 0.012 },
          delay: 0.01,
          gain: 0.1,
        },
      ],
    },
    warning: {
      layers: [
        {
          source: { type: 'sine', frequency: 440 },
          envelope: { attack: 0, decay: 0.03, sustain: 0, release: 0.01 },
          gain: 0.1,
        },
        {
          source: { type: 'sine', frequency: 466 },
          envelope: { attack: 0, decay: 0.03, sustain: 0, release: 0.01 },
          delay: 0.008,
          gain: 0.08,
        },
      ],
    },
    notification: {
      layers: [
        {
          source: { type: 'sine', frequency: 660 },
          envelope: { attack: 0, decay: 0.05, sustain: 0, release: 0.02 },
          gain: 0.1,
        },
        {
          source: { type: 'sine', frequency: 880 },
          envelope: { attack: 0, decay: 0.04, sustain: 0, release: 0.015 },
          delay: 0.08,
          gain: 0.08,
        },
      ],
    },
    info: {
      source: { type: 'sine', frequency: 880 },
      envelope: { attack: 0, decay: 0.04, sustain: 0, release: 0.015 },
      gain: 0.08,
    },
    copy: {
      layers: [
        {
          source: { type: 'sine', frequency: 1000 },
          envelope: { attack: 0, decay: 0.012, sustain: 0, release: 0.004 },
          gain: 0.08,
        },
        {
          source: { type: 'sine', frequency: 1200 },
          envelope: { attack: 0, decay: 0.012, sustain: 0, release: 0.004 },
          delay: 0.035,
          gain: 0.07,
        },
      ],
    },
    send: {
      source: { type: 'sine', frequency: { start: 600, end: 1000 } },
      envelope: { attack: 0, decay: 0.04, sustain: 0, release: 0.012 },
      gain: 0.08,
    },
    delete: {
      source: { type: 'sine', frequency: { start: 500, end: 250 } },
      envelope: { attack: 0, decay: 0.05, sustain: 0, release: 0.015 },
      gain: 0.1,
    },
    undo: {
      source: { type: 'sine', frequency: { start: 800, end: 600 } },
      envelope: { attack: 0, decay: 0.035, sustain: 0, release: 0.01 },
      gain: 0.07,
    },
    pop: {
      source: { type: 'sine', frequency: { start: 400, end: 200 } },
      envelope: { attack: 0, decay: 0.04, sustain: 0, release: 0.012 },
      gain: 0.1,
    },
    swoosh: {
      source: { type: 'sine', frequency: { start: 600, end: 1400 } },
      envelope: { attack: 0.005, decay: 0.04, sustain: 0, release: 0.015 },
      gain: 0.05,
    },
    slide: {
      source: { type: 'sine', frequency: { start: 800, end: 1100 } },
      envelope: { attack: 0.003, decay: 0.035, sustain: 0, release: 0.012 },
      gain: 0.05,
    },
  },
} satisfies SoundPatch

export const UIAudio = definePatch(minimalPatch) as Omit<AudioPatch, 'sounds'> & {
  sounds: Array<UIAudio.SoundKey>
  play: (name: UIAudio.SoundKey, opts?: PlayOptions) => VoiceHandle
  get: (name: UIAudio.SoundKey) => SoundDefinition | undefined
}

declare global {
  namespace UIAudio {
    type SoundKey = keyof typeof minimalPatch.sounds
  }
}
