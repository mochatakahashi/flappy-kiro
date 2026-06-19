// Ghost physics property tests — Properties 1-3
import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { updateGhost, flapGhost, calculateRotation } from '../src/ghost.js';

describe('Ghost Physics - Property-Based Tests', () => {
  describe('Property 1: Ghost velocity update applies gravity with terminal velocity', () => {
    /**
     * For any ghost with velocity v, after one update,
     * resulting velocity = min(v + 0.5, 12)
     *
     * Validates: Requirements 2.1, 2.4
     */
    it('should apply gravity and clamp to terminal velocity for any initial velocity', () => {
      fc.assert(
        fc.property(fc.float({ min: -20, max: 20, noNaN: true }), (velocity) => {
          const ghost = {
            x: 100,
            y: 200,
            velocity,
            width: 40,
            height: 30,
            rotation: 0,
          };

          updateGhost(ghost);

          const expectedVelocity = Math.min(velocity + 0.5, 12);
          expect(ghost.velocity).toBeCloseTo(expectedVelocity, 5);
        }),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 2: Flap replaces current velocity', () => {
    /**
     * For any ghost with any velocity, after flap, velocity = -8 exactly
     *
     * Validates: Requirements 2.2
     */
    it('should set velocity to exactly -8 regardless of previous velocity', () => {
      fc.assert(
        fc.property(fc.float({ min: -20, max: 20, noNaN: true }), (velocity) => {
          const ghost = {
            x: 100,
            y: 200,
            velocity,
            width: 40,
            height: 30,
            rotation: 0,
          };

          flapGhost(ghost);

          expect(ghost.velocity).toBe(-8);
        }),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 3: Ghost rotation stays within bounds', () => {
    /**
     * For any ghost velocity, computed rotation is in [-30, 90]
     *
     * Validates: Requirements 2.5
     */
    it('should produce rotation within [-30, 90] for any velocity', () => {
      fc.assert(
        fc.property(fc.float({ min: -50, max: 50, noNaN: true }), (velocity) => {
          const rotation = calculateRotation(velocity);

          expect(rotation).toBeGreaterThanOrEqual(-30);
          expect(rotation).toBeLessThanOrEqual(90);
        }),
        { numRuns: 100 }
      );
    });
  });
});
