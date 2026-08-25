import type { Doc } from '../../convex/_generated/dataModel'

/* The ratio of the game content height to the window height. */
export const GAME_CONTENT_HEIGHT_RATIO = 0.6666

/**
 * Whether the browser supports setting the audio output device.
 * E.g. Chrome Android doesn't support `audiooutput` devices.
 */
export const HAVE_AUDIO_OUTPUT_SELECTOR =
  typeof HTMLMediaElement !== 'undefined' && 'setSinkId' in HTMLMediaElement.prototype

/* `x` offset on the hats.png sprite for the hog */
export type Hat = keyof typeof HAT_INDEX
export const HAT_INDEX = {
  painter: 0,
  baseball: 1,
  chef: 2,
  cowboy: 3,
  'eye-patch': 4,
  childish: 5,
  glasses: 6,
  academic: 7,
  earing: 8,
  cone: 9,
  pineapple: 10,
  shades: 11,
  'top-hat': 12,
  antlers: 13,
  santa: 14,
  scarf: 15,
  admin: 16,
} as const

export const SAMPLING_INTERVAL_MS = 33
export const BATCHING_INTERVAL_MS = 100
export const INTERPOLATION_DELAY_MS = 200
export const HEARTBEAT_MS = 10_000

/** @description in "world units" per every frame, 0 to 100 */
export const PLAYER_BASE_SPEED_PX_PER_SEC = 4
export const PLAYER_RUNNING_SPEED_MOD = 2.0
export const PLAYER_SIZE = { width: 300, height: 300 }
export const PLAYER_HITBOX_SIZE = { width: 200, height: 300 }

export const COMMON_SCENE_HEIGHT = 1080
export const SCENE: Record<
  Doc<'game_user_state'>['scene'],
  {
    /** @description In px */
    width: number
    /** @description In px */
    height: number
    /** @description In "world units", 0 to 100 */
    playerInitialX: number
    /** @description In "world units", 0 to 100 */
    playerInitialY: number
  }
> = {
  main: { width: 6043, height: COMMON_SCENE_HEIGHT, playerInitialX: 5, playerInitialY: 80 },
  tour: { width: 3596, height: COMMON_SCENE_HEIGHT, playerInitialX: 5, playerInitialY: 85 },
}
