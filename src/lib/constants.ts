/* The ratio of the game content height to the window height. */
export const GAME_CONTENT_HEIGHT_RATIO = 0.6666

/**
 * Whether the browser supports setting the audio output device.
 * E.g. Chrome Android doesn't support `audiooutput` devices.
 */
export const HAVE_AUDIO_OUTPUT_SELECTOR =
  typeof HTMLMediaElement !== 'undefined' && 'setSinkId' in HTMLMediaElement.prototype

/* In "world units", 0 to 100 */
export const SCENE_PLAYER_OFFSET_Y = 85

/* In "world units", 0 to 100 */
export const INITIAL_PLAYER_POSITION = { x: 5, y: 85 }

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

export const ORIGINAL_SCENE_SIZE = { width: 6043, height: 1080 }
export const PLAYER_SIZE = { width: 300, height: 300 }

export const PLAYER_BASE_SPEED = 0.2
export const PLAYER_RUNNING_SPEED_MOD = 2.0

export const HEARTBEAT_MS = 10_000
