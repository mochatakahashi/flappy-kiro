import { CONFIG } from './config.js';

const { speed, spacing, gapHeight, gapMinPercent, gapMaxPercent, capOverhangPercent } = CONFIG.pipes;

const PIPE_WIDTH = 60;
const CAP_HEIGHT = 20;
const CAP_WIDTH = PIPE_WIDTH * (1 + 2 * capOverhangPercent);

/**
 * Creates a new pipe pair at the given x position.
 * Gap center is randomized between 20%-80% of playable height.
 */
export function createPipe(x, playableHeight) {
  const minY = playableHeight * gapMinPercent;
  const maxY = playableHeight * gapMaxPercent;
  const gapCenterY = minY + Math.random() * (maxY - minY);

  return {
    x,
    gapCenterY,
    gapHeight,
    width: PIPE_WIDTH,
    capWidth: CAP_WIDTH,
    capHeight: CAP_HEIGHT,
    scored: false,
  };
}

/**
 * Scrolls all pipes left at constant speed and removes off-screen pipes.
 */
export function updatePipes(pipes) {
  for (const pipe of pipes) {
    pipe.x -= speed;
  }
  return pipes.filter(pipe => pipe.x + pipe.width > 0);
}

/**
 * Determines whether a new pipe should be spawned based on spacing threshold.
 */
export function shouldSpawnPipe(pipes, canvasWidth) {
  if (pipes.length === 0) return true;
  const last = pipes[pipes.length - 1];
  return last.x <= canvasWidth - spacing;
}

/**
 * Returns the AABB for the top pipe section (from y=0 down to gap top).
 */
export function getTopPipeBounds(pipe) {
  const gapTop = pipe.gapCenterY - pipe.gapHeight / 2;
  return {
    x: pipe.x,
    y: 0,
    width: pipe.width,
    height: gapTop,
  };
}

/**
 * Returns the AABB for the bottom pipe section (from gap bottom to playable height).
 */
export function getBottomPipeBounds(pipe, playableHeight) {
  const gapBottom = pipe.gapCenterY + pipe.gapHeight / 2;
  return {
    x: pipe.x,
    y: gapBottom,
    width: pipe.width,
    height: playableHeight - gapBottom,
  };
}
