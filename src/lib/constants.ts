/* The ratio of the game content height to the window height. */
export const GAME_CONTENT_HEIGHT_RATIO = 0.6666

/**
 * Whether the browser supports setting the audio output device.
 * E.g. Chrome Android doesn't support `audiooutput` devices.
 */
export const HAVE_AUDIO_OUTPUT_SELECTOR =
  typeof HTMLMediaElement !== 'undefined' && 'setSinkId' in HTMLMediaElement.prototype
