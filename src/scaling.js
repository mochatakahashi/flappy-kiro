/**
 * Responsive canvas scaling utilities.
 * All game physics operate at 800×600 logical resolution.
 * This module handles CSS/display scaling to fit the viewport.
 */

import { CONFIG } from './config.js';

const ASPECT_RATIO = CONFIG.canvas.width / CONFIG.canvas.height; // 4:3
const MIN_VIEWPORT_WIDTH = 300;
const MIN_VIEWPORT_HEIGHT = 225;

/**
 * Compute the display size for the canvas given viewport dimensions.
 * Maintains 4:3 aspect ratio and fits entirely within the viewport.
 * At viewports smaller than 300×225, returns minimum size without cropping.
 *
 * @param {number} viewportWidth - Available viewport width in CSS pixels
 * @param {number} viewportHeight - Available viewport height in CSS pixels
 * @returns {{ width: number, height: number }} Display size in CSS pixels
 */
export function computeCanvasDisplaySize(viewportWidth, viewportHeight) {
  // Enforce minimum dimensions to prevent cropping at very small viewports
  const effectiveWidth = Math.max(viewportWidth, MIN_VIEWPORT_WIDTH);
  const effectiveHeight = Math.max(viewportHeight, MIN_VIEWPORT_HEIGHT);

  let displayWidth, displayHeight;

  if (effectiveWidth / effectiveHeight > ASPECT_RATIO) {
    // Viewport is wider than 4:3 — height is the constraint
    displayHeight = effectiveHeight;
    displayWidth = displayHeight * ASPECT_RATIO;
  } else {
    // Viewport is taller than 4:3 — width is the constraint
    displayWidth = effectiveWidth;
    displayHeight = displayWidth / ASPECT_RATIO;
  }

  return { width: displayWidth, height: displayHeight };
}

/**
 * Apply responsive scaling to a canvas element.
 * Sets CSS width/height based on current viewport.
 * The canvas logical resolution (width/height attributes) remains unchanged.
 *
 * @param {HTMLCanvasElement} canvas - The game canvas element
 */
export function applyCanvasScaling(canvas) {
  const { width, height } = computeCanvasDisplaySize(
    window.innerWidth,
    window.innerHeight
  );
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
}

/**
 * Set up responsive canvas scaling that adjusts on window resize.
 * Uses requestAnimationFrame to handle resize within the animation frame cycle.
 *
 * @param {HTMLCanvasElement} canvas - The game canvas element
 * @returns {function} Cleanup function to remove the resize listener
 */
export function setupResponsiveCanvas(canvas) {
  // Initial scaling
  applyCanvasScaling(canvas);

  let resizeScheduled = false;

  function onResize() {
    if (!resizeScheduled) {
      resizeScheduled = true;
      requestAnimationFrame(() => {
        applyCanvasScaling(canvas);
        resizeScheduled = false;
      });
    }
  }

  window.addEventListener('resize', onResize);

  // Return cleanup function
  return () => window.removeEventListener('resize', onResize);
}
