/**
 * Centralized configuration module.
 * All tunable game constants in one place — no magic numbers elsewhere.
 * Values use per-frame units at assumed 60 FPS.
 */
export const CONFIG = Object.freeze({
  canvas: Object.freeze({
    width: 800,
    height: 600,
    groundHeightPercent: 0.10,
  }),
  ghost: Object.freeze({
    gravity: 0.5,
    flapVelocity: -8,
    maxFallSpeed: 12,
    minRotation: -30,
    maxRotation: 90,
  }),
  pipes: Object.freeze({
    speed: 3,
    spacing: 300,
    gapHeight: 150,
    gapMinPercent: 0.2,
    gapMaxPercent: 0.8,
    capOverhangPercent: 0.1,
  }),
  clouds: Object.freeze({
    minSpeed: 0.5,
    maxSpeed: 1.5,
    minOpacity: 0.3,
    maxOpacity: 0.7,
  }),
  scoring: Object.freeze({
    storageKey: 'flappyKiro_highScore',
  }),
  timing: Object.freeze({
    restartDelay: 500,
  }),
});
