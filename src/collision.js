import { getGhostBounds } from './ghost.js';
import { getTopPipeBounds, getBottomPipeBounds } from './pipes.js';

/**
 * Axis-Aligned Bounding Box collision check.
 * Returns true if boxes a and b overlap on both axes.
 * @param {{ x: number, y: number, width: number, height: number }} a
 * @param {{ x: number, y: number, width: number, height: number }} b
 * @returns {boolean}
 */
export function checkAABBCollision(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

/**
 * Checks whether the ghost collides with any pipe, the ground, or the ceiling.
 * @param {object} ghost - Ghost entity with x, y, width, height properties.
 * @param {object[]} pipes - Array of pipe objects.
 * @param {number} groundY - Y coordinate of the ground surface.
 * @param {number} canvasHeight - Full canvas height (unused but kept for interface completeness).
 * @returns {boolean} true if any collision detected, false otherwise.
 */
export function checkGhostCollisions(ghost, pipes, groundY, canvasHeight) {
  const ghostBounds = getGhostBounds(ghost);

  // Ground collision: ghost bottom edge >= groundY
  if (ghostBounds.y + ghostBounds.height >= groundY) {
    return true;
  }

  // Ceiling collision: ghost top edge <= 0
  if (ghostBounds.y <= 0) {
    return true;
  }

  // Pipe collisions: check against top and bottom sections of each pipe
  for (const pipe of pipes) {
    const topBounds = getTopPipeBounds(pipe);
    const bottomBounds = getBottomPipeBounds(pipe, groundY);

    if (checkAABBCollision(ghostBounds, topBounds)) {
      return true;
    }
    if (checkAABBCollision(ghostBounds, bottomBounds)) {
      return true;
    }
  }

  return false;
}
