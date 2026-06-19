// Pipe system property tests — Properties 4-6
import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { createPipe, updatePipes } from '../src/pipes.js';

describe('Pipe System - Property-Based Tests', () => {
  describe('Property 4: Pipe creation invariants', () => {
    /**
     * For any playable height in [200, 800], gap center is between 20%-80%
     * of playable height, gap height is exactly 150px, and cap width >= 120%
     * of pipe body width.
     *
     * Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 7.4
     */
    it('should satisfy gap center, gap height, and cap width invariants for any playable height', () => {
      fc.assert(
        fc.property(fc.integer({ min: 200, max: 800 }), (playableHeight) => {
          const pipe = createPipe(800, playableHeight);

          // Gap center Y is between 20% and 80% of playable height
          expect(pipe.gapCenterY).toBeGreaterThanOrEqual(playableHeight * 0.2);
          expect(pipe.gapCenterY).toBeLessThanOrEqual(playableHeight * 0.8);

          // Gap height is exactly 150px
          expect(pipe.gapHeight).toBe(150);

          // Cap width >= 120% of pipe body width
          expect(pipe.capWidth).toBeGreaterThanOrEqual(pipe.width * 1.2);
        }),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 5: Pipe scrolling is constant speed', () => {
    /**
     * For any pipe at position x, after one update, x position = x - 3.
     *
     * Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 7.4
     */
    it('should move pipe left by exactly 3 pixels per update for any x position', () => {
      fc.assert(
        fc.property(fc.float({ min: -1000, max: 2000, noNaN: true }), (randomX) => {
          const pipe = {
            x: randomX,
            gapCenterY: 200,
            gapHeight: 150,
            width: 60,
            capWidth: 72,
            capHeight: 20,
            scored: false,
          };

          const pipes = [pipe];
          updatePipes(pipes);

          expect(pipe.x).toBeCloseTo(randomX - 3, 5);
        }),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 6: Off-screen pipes are removed', () => {
    /**
     * After an update, no pipe should remain if its right edge (x + width) < 0.
     *
     * Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 7.4
     */
    it('should remove all pipes whose right edge is past the left boundary after update', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.float({ min: -200, max: 1000, noNaN: true }),
            { minLength: 1, maxLength: 20 }
          ),
          (xValues) => {
            const pipes = xValues.map((x) => ({
              x,
              gapCenterY: 200,
              gapHeight: 150,
              width: 60,
              capWidth: 72,
              capHeight: 20,
              scored: false,
            }));

            const result = updatePipes(pipes);

            // After update, no remaining pipe should have right edge <= 0
            for (const pipe of result) {
              expect(pipe.x + pipe.width).toBeGreaterThan(0);
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
