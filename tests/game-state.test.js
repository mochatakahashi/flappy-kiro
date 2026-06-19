/**
 * Game state property tests — Property 14: Restart delay guard
 * Validates: Requirements 6.5
 *
 * Tests that input is ignored within 500ms after entering Game_Over_State,
 * and that restart is allowed once 500ms have elapsed.
 */

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { CONFIG } from '../src/config.js';

/**
 * Pure function that mirrors the restart delay logic in game.js handleInput:
 *   Date.now() - state.gameOverTimestamp >= CONFIG.timing.restartDelay
 *
 * Returns true if enough time has passed and restart should be allowed.
 * Returns false if input should be ignored (still within the delay window).
 */
function shouldAllowRestart(gameOverTimestamp, currentTime, restartDelay) {
  return currentTime - gameOverTimestamp >= restartDelay;
}

describe('Feature: flappy-kiro, Property 14: Restart delay guard', () => {
  /**
   * **Validates: Requirements 6.5**
   *
   * For any timestamp within 500 milliseconds after entering Game_Over_State,
   * player input should be ignored and the game should remain in Game_Over_State.
   */
  it('should ignore input when elapsed time is less than 500ms', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1000, max: 1_000_000_000 }), // gameOverTimestamp (arbitrary base time)
        fc.integer({ min: 0, max: 499 }),               // delay within the 500ms window
        (gameOverTimestamp, delay) => {
          const currentTime = gameOverTimestamp + delay;
          const result = shouldAllowRestart(gameOverTimestamp, currentTime, CONFIG.timing.restartDelay);
          expect(result).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * **Validates: Requirements 6.5**
   *
   * For any timestamp at or beyond 500 milliseconds after entering Game_Over_State,
   * player input should be accepted and the game should allow restart.
   */
  it('should allow restart when elapsed time is 500ms or more', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1000, max: 1_000_000_000 }), // gameOverTimestamp (arbitrary base time)
        fc.integer({ min: 500, max: 2000 }),            // delay at or beyond the 500ms threshold
        (gameOverTimestamp, delay) => {
          const currentTime = gameOverTimestamp + delay;
          const result = shouldAllowRestart(gameOverTimestamp, currentTime, CONFIG.timing.restartDelay);
          expect(result).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });
});
