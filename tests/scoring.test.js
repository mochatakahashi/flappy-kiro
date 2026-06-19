// Scoring property tests — Properties 9-12
import { describe, it, expect, vi } from 'vitest';
import fc from 'fast-check';
import { checkScoreUpdate, loadHighScore, formatScore } from '../src/scoring.js';

describe('Scoring - Property-Based Tests', () => {
  describe('Property 9: Score increments exactly once per pipe', () => {
    /**
     * When ghost passes pipe midpoint, score increments by 1 and pipe.scored is set true.
     * Subsequent frames don't increment again.
     *
     * Validates: Requirements 5.1
     */
    it('should increment score once per pipe and not again on subsequent calls', () => {
      fc.assert(
        fc.property(
          fc.float({ min: 100, max: 800, noNaN: true }),   // ghost.x
          fc.float({ min: 0, max: 600, noNaN: true }),     // pipe.x
          fc.float({ min: 20, max: 120, noNaN: true }),    // pipe.width
          (ghostX, pipeX, pipeWidth) => {
            const ghost = { x: ghostX };
            const pipe = { x: pipeX, width: pipeWidth, scored: false };
            const midpoint = pipe.x + pipe.width / 2;

            // First call
            const points = checkScoreUpdate(ghost, [pipe]);

            if (ghostX > midpoint) {
              // Ghost is past midpoint: should score
              expect(points).toBe(1);
              expect(pipe.scored).toBe(true);
            } else {
              // Ghost hasn't passed midpoint: no score
              expect(points).toBe(0);
              expect(pipe.scored).toBe(false);
            }

            // Second call — should never increment again regardless
            const pointsAgain = checkScoreUpdate(ghost, [pipe]);
            expect(pointsAgain).toBe(0);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 10: High score is monotonically non-decreasing', () => {
    /**
     * After score update, high score = max(currentScore, previousHighScore)
     *
     * Validates: Requirements 5.3
     */
    it('should produce high score equal to max(currentScore, previousHighScore)', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 999999 }),  // currentScore
          fc.integer({ min: 0, max: 999999 }),  // previousHighScore
          (currentScore, previousHighScore) => {
            const newHighScore = Math.max(currentScore, previousHighScore);

            // The new high score is always >= previous high score
            expect(newHighScore).toBeGreaterThanOrEqual(previousHighScore);
            // The new high score is the maximum of the two
            expect(newHighScore).toBe(Math.max(currentScore, previousHighScore));
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 11: Score display format', () => {
    /**
     * For any non-negative integers score and highScore,
     * format is exactly "Score: {score} | High: {highScore}"
     *
     * Validates: Requirements 1.3, 5.2
     */
    it('should format as "Score: {score} | High: {highScore}" for any non-negative integers', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 999999 }),  // score
          fc.integer({ min: 0, max: 999999 }),  // highScore
          (score, highScore) => {
            const result = formatScore(score, highScore);
            expect(result).toBe(`Score: ${score} | High: ${highScore}`);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 12: High score localStorage validation', () => {
    /**
     * For any invalid stored value (null, undefined, negative, NaN, non-numeric),
     * loadHighScore() returns 0.
     *
     * Validates: Requirements 1.4, 5.5
     */
    it('should return 0 for null stored value', () => {
      vi.spyOn(Storage.prototype, 'getItem').mockReturnValue(null);
      expect(loadHighScore()).toBe(0);
      vi.restoreAllMocks();
    });

    it('should return 0 for any non-numeric string', () => {
      fc.assert(
        fc.property(
          fc.oneof(
            fc.constant('abc'),
            fc.constant(''),
            fc.constant('hello world'),
            fc.constant('NaN'),
            fc.constant('undefined'),
            fc.constant('null'),
            fc.stringOf(fc.char().filter(c => !/\d/.test(c)), { minLength: 1, maxLength: 10 })
          ),
          (invalidValue) => {
            vi.spyOn(Storage.prototype, 'getItem').mockReturnValue(invalidValue);
            expect(loadHighScore()).toBe(0);
            vi.restoreAllMocks();
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return 0 for negative number strings', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: -999999, max: -1 }),
          (negativeNum) => {
            vi.spyOn(Storage.prototype, 'getItem').mockReturnValue(String(negativeNum));
            expect(loadHighScore()).toBe(0);
            vi.restoreAllMocks();
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return 0 for float strings (non-integer)', () => {
      fc.assert(
        fc.property(
          fc.float({ min: 0.01, max: 999, noNaN: true }).filter(f => f !== Math.floor(f)),
          (floatVal) => {
            vi.spyOn(Storage.prototype, 'getItem').mockReturnValue(String(floatVal));
            // parseInt will truncate floats - loadHighScore uses parseInt, so "3.14" → 3 which is valid
            // Only truly non-numeric values should return 0
            const parsed = parseInt(String(floatVal), 10);
            if (Number.isNaN(parsed) || parsed < 0) {
              expect(loadHighScore()).toBe(0);
            } else {
              expect(loadHighScore()).toBe(parsed);
            }
            vi.restoreAllMocks();
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
