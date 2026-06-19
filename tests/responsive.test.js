// Responsive canvas scaling property tests — Property 15
import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { computeCanvasDisplaySize } from '../src/scaling.js';

describe('Feature: flappy-kiro, Property 15: Canvas scaling preserves aspect ratio', () => {
  /**
   * **Validates: Requirements 9.2**
   *
   * For any viewport dimensions (width, height), the computed canvas display size
   * should maintain a 4:3 aspect ratio (800:600) and fit entirely within the
   * viewport without exceeding either dimension.
   */
  it('should maintain 4:3 aspect ratio and fit within viewport for any dimensions', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 100, max: 4000 }), // viewportWidth
        fc.integer({ min: 100, max: 4000 }), // viewportHeight
        (viewportWidth, viewportHeight) => {
          const { width, height } = computeCanvasDisplaySize(viewportWidth, viewportHeight);

          // Aspect ratio is 4:3 (tolerance for floating point)
          const ratio = width / height;
          expect(ratio).toBeCloseTo(4 / 3, 5);

          // Fits within the effective viewport (with min 300x225 enforcement)
          const effectiveW = Math.max(viewportWidth, 300);
          const effectiveH = Math.max(viewportHeight, 225);
          expect(width).toBeLessThanOrEqual(effectiveW + 0.001);
          expect(height).toBeLessThanOrEqual(effectiveH + 0.001);
        }
      ),
      { numRuns: 100 }
    );
  });
});
