/**
 * Audio Manager module.
 * Handles sound effect loading and playback for the game.
 * All play() calls are wrapped in try-catch for resilience —
 * audio failures never break the game loop.
 */

/**
 * Creates an AudioManager with preloaded jump and game over sounds.
 * Sets onerror handlers so failed loads null out the reference
 * rather than causing runtime errors later.
 *
 * @returns {{ jumpSound: HTMLAudioElement | null, gameOverSound: HTMLAudioElement | null }}
 */
export function createAudioManager() {
  let jumpSound = null;
  let gameOverSound = null;

  try {
    jumpSound = new Audio('assets/jump.wav');
    jumpSound.onerror = () => {
      jumpSound = null;
    };
  } catch (e) {
    console.warn('Failed to create jump sound:', e);
    jumpSound = null;
  }

  try {
    gameOverSound = new Audio('assets/game_over.wav');
    gameOverSound.onerror = () => {
      gameOverSound = null;
    };
  } catch (e) {
    console.warn('Failed to create game over sound:', e);
    gameOverSound = null;
  }

  return { jumpSound, gameOverSound };
}

/**
 * Plays the jump sound effect, restarting from the beginning
 * if it's already playing.
 *
 * @param {{ jumpSound: HTMLAudioElement | null, gameOverSound: HTMLAudioElement | null }} audio
 */
export function playJump(audio) {
  if (!audio.jumpSound) return;
  try {
    audio.jumpSound.currentTime = 0;
    audio.jumpSound.play();
  } catch (e) {
    console.warn('Failed to play jump sound:', e);
  }
}

/**
 * Plays the game over sound effect for collision feedback.
 *
 * @param {{ jumpSound: HTMLAudioElement | null, gameOverSound: HTMLAudioElement | null }} audio
 */
export function playGameOver(audio) {
  if (!audio.gameOverSound) return;
  try {
    audio.gameOverSound.currentTime = 0;
    audio.gameOverSound.play();
  } catch (e) {
    console.warn('Failed to play game over sound:', e);
  }
}

/**
 * Stops all currently playing audio and resets playback position.
 * Called on game restart to clear sounds from the previous session.
 *
 * @param {{ jumpSound: HTMLAudioElement | null, gameOverSound: HTMLAudioElement | null }} audio
 */
export function stopAll(audio) {
  if (audio.jumpSound) {
    try {
      audio.jumpSound.pause();
      audio.jumpSound.currentTime = 0;
    } catch (e) {
      console.warn('Failed to stop jump sound:', e);
    }
  }

  if (audio.gameOverSound) {
    try {
      audio.gameOverSound.pause();
      audio.gameOverSound.currentTime = 0;
    } catch (e) {
      console.warn('Failed to stop game over sound:', e);
    }
  }
}
