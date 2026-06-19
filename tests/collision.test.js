// Collision detection property tests — Properties 7-8
import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { checkAABBCollision, checkGhostCollisions } from '../src/collision.js';

/**
 * Property 7: AABB collision detection correctness
 * For any two bounding boxes A and B, checkAABBCollision returns true
 * iff they overlap on both axes.
 *
 * Validates: Requirements 4.2, 4.5
 */
describe('Property 7: AABB collision detection correctness', () => {
  it('returns true iff two bounding boxes overlap on both axes', () => {
    const boxArb = fc.record({
      x: fc.double({ min: -100, max: 900, noNaN: true, noDefaultInfinity: true }),
      y: fc.double({ min: -100, max: 900, noNaN: true, noDefaultInfinity: true }),
      width: fc.double({ min: 1, max: 200, noNaN: true, noDefaultInfinity: true }),
      height: fc.double({ min: 1, max: 200, noNaN: true, noDefaultInfinity: true }),
    });

    fc.assert(
      fc.property(boxArb, boxArb, (a, b) => {
        const expected =
          a.x < b.x + b.width &&
          a.x + a.width > b.x &&
          a.y < b.y + b.height &&
          a.y + a.height > b.y;

        expect(checkAABBCollision(a, b)).toBe(expected);
      }),
      { numRuns: 100 }
    );
  });
});

/**
 * Property 8: Boundary collision detection
 * For any ghost position, ground collision iff ghost.y + ghost.height >= groundY,
 * ceiling collision iff ghost.y <= 0.
 *
 * Validates: Requirements 4.3, 4.4
 */
describe('Property 8: Boundary collision detection', () => {
  const GROUND_Y = 540; // 600 * (1 - 0.10)

  it('detects ground and ceiling collisions correctly with no pipes', () => {
    const ghostYArb = fc.double({ min: -100, max: 700, noNaN: true, noDefaultInfinity: true });
    const ghostHeightArb = fc.double({ min: 10, max: 80, noNaN: true, noDefaultInfinity: true });

    fc.assert(
      fc.property(ghostYArb, ghostHeightArb, (y, height) => {
        const ghost = { x: 100, y, width: 40, height };

        const groundCollision = ghost.y + ghost.height >= GROUND_Y;
        const ceilingCollision = ghost.y <= 0;
        const expectedCollision = groundCollision || ceilingCollision;

        const result = checkGhostCollisions(ghost, [], GROUND_Y, 600);

        expect(result).toBe(expectedCollision);
      }),
      { numRuns: 100 }
    );
  });
});
