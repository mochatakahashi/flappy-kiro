import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { createCloud } from '../src/clouds.js';

describe('Feature: flappy-kiro, Property 13: Cloud speed invariant', () => {
  /**
   * **Validates: Requirements 7.2**
   *
   * For any cloud created by the cloud factory, its speed should be
   * within the range [0.5, 1.5] pixels per frame inclusive.
   */
  it('cloud speed is always within [0.5, 1.5]', () => {
    fc.assert(
      fc.property(fc.integer(), () => {
        const cloud = createCloud(800, 600);
        expect(cloud.speed).toBeGreaterThanOrEqual(0.5);
        expect(cloud.speed).toBeLessThanOrEqual(1.5);
      }),
      { numRuns: 100 }
    );
  });

  it('cloud opacity is always within [0.3, 0.7]', () => {
    fc.assert(
      fc.property(fc.integer(), () => {
        const cloud = createCloud(800, 600);
        expect(cloud.opacity).toBeGreaterThanOrEqual(0.3);
        expect(cloud.opacity).toBeLessThanOrEqual(0.7);
      }),
      { numRuns: 100 }
    );
  });
});
