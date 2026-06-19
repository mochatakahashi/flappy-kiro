import { CONFIG } from './config.js';

/**
 * Ghost entity — the player-controlled character.
 * Uses per-frame physics with gravity, flap impulse, and velocity clamping.
 */

// Pre-computed constants for rotation mapping
const VELOCITY_RANGE = CONFIG.ghost.maxFallSpeed - CONFIG.ghost.flapVelocity;
const ROTATION_RANGE = CONFIG.ghost.maxRotation - CONFIG.ghost.minRotation;

/**
 * Creates a new Ghost entity at the initial start position.
 * Positioned at left third horizontally, vertically centered in the playable area.
 */
export function createGhost() {
  const playableHeight = CONFIG.canvas.height * (1 - CONFIG.canvas.groundHeightPercent);
  const width = 40;
  const height = 30;

  return {
    x: Math.trunc(CONFIG.canvas.width / 3) - Math.trunc(width / 2),
    y: Math.trunc(playableHeight / 2) - Math.trunc(height / 2),
    velocity: 0,
    width,
    height,
    rotation: 0,
  };
}

/**
 * Applies one frame of gravity to the ghost, clamps velocity to terminal speed,
 * updates position, and recalculates rotation.
 * Pure update: mutates and returns the same ghost object for performance.
 */
export function updateGhost(ghost) {
  // Apply gravity
  ghost.velocity += CONFIG.ghost.gravity;
  // Clamp to terminal velocity
  ghost.velocity = Math.min(ghost.velocity, CONFIG.ghost.maxFallSpeed);
  // Update position
  ghost.y += ghost.velocity;
  // Update rotation based on current velocity
  ghost.rotation = calculateRotation(ghost.velocity);
  return ghost;
}

/**
 * Applies a flap impulse — replaces current velocity entirely.
 */
export function flapGhost(ghost) {
  ghost.velocity = CONFIG.ghost.flapVelocity;
  ghost.rotation = calculateRotation(ghost.velocity);
  return ghost;
}

/**
 * Returns the AABB bounding box for collision detection.
 */
export function getGhostBounds(ghost) {
  return {
    x: ghost.x,
    y: ghost.y,
    width: ghost.width,
    height: ghost.height,
  };
}

/**
 * Maps velocity to a rotation angle in [-30°, +90°].
 * Linear interpolation: flap velocity → -30°, max fall → +90°.
 */
export function calculateRotation(velocity) {
  const t = (velocity - CONFIG.ghost.flapVelocity) / VELOCITY_RANGE;
  const clamped = Math.max(0, Math.min(1, t));
  return CONFIG.ghost.minRotation + clamped * ROTATION_RANGE;
}
