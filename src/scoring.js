import { CONFIG } from './config.js';

/**
 * Checks if the ghost has passed any pipe midpoints this frame.
 * Increments score once per pipe when ghost.x passes pipe.x + pipe.width / 2.
 * Marks pipe.scored = true to prevent double-counting.
 *
 * @param {object} ghost - The ghost entity with an x property.
 * @param {object[]} pipes - Array of pipe objects with x, width, and scored properties.
 * @returns {number} The number of new points earned this frame (0 or more).
 */
export function checkScoreUpdate(ghost, pipes) {
  let points = 0;
  for (const pipe of pipes) {
    if (!pipe.scored && ghost.x > pipe.x + pipe.width / 2) {
      pipe.scored = true;
      points += 1;
    }
  }
  return points;
}

/**
 * Loads the high score from localStorage.
 * Returns 0 if the value is missing, NaN, or negative.
 *
 * @returns {number} The persisted high score, or 0 on any failure.
 */
export function loadHighScore() {
  try {
    const raw = localStorage.getItem(CONFIG.scoring.storageKey);
    const parsed = parseInt(raw, 10);
    return (Number.isNaN(parsed) || parsed < 0) ? 0 : parsed;
  } catch {
    return 0;
  }
}

/**
 * Saves the high score to localStorage.
 * Silently catches errors if storage is unavailable.
 *
 * @param {number} score - The high score value to persist.
 */
export function saveHighScore(score) {
  try {
    localStorage.setItem(CONFIG.scoring.storageKey, String(score));
  } catch {
    // Storage unavailable — silently continue
  }
}

/**
 * Formats the current score and high score into a display string.
 *
 * @param {number} score - The current score.
 * @param {number} highScore - The high score.
 * @returns {string} Formatted string "Score: {score} | High: {highScore}".
 */
export function formatScore(score, highScore) {
  return `Score: ${score} | High: ${highScore}`;
}
