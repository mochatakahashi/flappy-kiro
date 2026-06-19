/**
 * Game Controller — main entry point, game loop, and state machine.
 * Orchestrates all game subsystems: physics, rendering, input, audio, scoring.
 */

import { CONFIG } from './config.js';
import { createGhost, updateGhost, flapGhost } from './ghost.js';
import { createPipe, updatePipes, shouldSpawnPipe } from './pipes.js';
import { createCloud, updateClouds } from './clouds.js';
import { checkGhostCollisions } from './collision.js';
import { checkScoreUpdate, loadHighScore, saveHighScore } from './scoring.js';
import { createAudioManager, playJump, playGameOver, stopAll } from './audio.js';
import { setupInputHandler } from './input.js';
import { renderBackground, renderClouds, renderPipes, renderGround, renderGhost, renderScore, renderGameOver } from './renderer.js';
import { setupResponsiveCanvas } from './scaling.js';

// Game states
const STATE = Object.freeze({
  IDLE: 'IDLE',
  PLAYING: 'PLAYING',
  GAME_OVER: 'GAME_OVER',
});

// Pre-computed layout constants
const CANVAS_WIDTH = CONFIG.canvas.width;
const CANVAS_HEIGHT = CONFIG.canvas.height;
const GROUND_Y = CANVAS_HEIGHT * (1 - CONFIG.canvas.groundHeightPercent);
const PLAYABLE_HEIGHT = GROUND_Y;

// Module-level references
let canvas = null;
let ctx = null;
let ghostSprite = null;
let spriteLoaded = false;
let audio = null;
let lastTimestamp = 0;

// Game state
let state = null;

/**
 * Creates the initial game state object.
 */
function createInitialState() {
  return {
    status: STATE.IDLE,
    ghost: createGhost(),
    pipes: [],
    clouds: createInitialClouds(),
    score: 0,
    highScore: loadHighScore(),
    gameOverTimestamp: null,
  };
}

/**
 * Creates 5-6 initial clouds spread across the canvas.
 */
function createInitialClouds() {
  const count = 5 + Math.round(Math.random());
  const clouds = [];
  for (let i = 0; i < count; i++) {
    clouds.push(createCloud(CANVAS_WIDTH, CANVAS_HEIGHT));
  }
  return clouds;
}

/**
 * Loads the ghost sprite image with a fallback rectangle on failure.
 * Includes a 5-second timeout.
 */
function loadGhostSprite() {
  return new Promise((resolve) => {
    const img = new Image();
    let settled = false;

    const timeout = setTimeout(() => {
      if (!settled) {
        settled = true;
        spriteLoaded = false;
        resolve(null);
      }
    }, 5000);

    img.onload = () => {
      if (!settled) {
        settled = true;
        clearTimeout(timeout);
        spriteLoaded = true;
        resolve(img);
      }
    };

    img.onerror = () => {
      if (!settled) {
        settled = true;
        clearTimeout(timeout);
        spriteLoaded = false;
        resolve(null);
      }
    };

    img.src = 'assets/ghosty.png';
  });
}

/**
 * Renders a fallback rectangle when the ghost sprite is unavailable.
 */
function renderGhostFallback(ctx, ghost) {
  ctx.save();
  ctx.translate(ghost.x + ghost.width / 2, ghost.y + ghost.height / 2);
  ctx.rotate(ghost.rotation * Math.PI / 180);
  ctx.fillStyle = '#9b59b6';
  ctx.fillRect(-ghost.width / 2, -ghost.height / 2, ghost.width, ghost.height);
  ctx.restore();
}

/**
 * Initializes the game: canvas, assets, audio, input, and starts the loop.
 */
export async function init() {
  canvas = document.getElementById('game-canvas');
  if (!canvas) return;

  // Canvas support check — display message if 2D context unavailable
  ctx = canvas.getContext('2d');
  if (!ctx) {
    const msg = document.createElement('p');
    msg.textContent = 'Browser not supported';
    msg.style.color = '#ffffff';
    msg.style.fontFamily = 'sans-serif';
    msg.style.fontSize = '1.5rem';
    msg.style.textAlign = 'center';
    canvas.parentNode.replaceChild(msg, canvas);
    return;
  }

  canvas.width = CANVAS_WIDTH;
  canvas.height = CANVAS_HEIGHT;

  // Set up responsive canvas scaling
  setupResponsiveCanvas(canvas);

  // Load assets
  ghostSprite = await loadGhostSprite();

  // Initialize audio
  audio = createAudioManager();

  // Initialize game state
  state = createInitialState();

  // Set up input handling
  setupInputHandler(canvas, handleInput);

  // Start game loop
  lastTimestamp = 0;
  requestAnimationFrame(gameLoop);
}

/**
 * Main game loop driven by requestAnimationFrame.
 * Handles tab backgrounding via delta-time clamping.
 */
export function gameLoop(timestamp) {
  // Tab backgrounding protection: if delta > ~32ms (2 frames), skip physics
  if (lastTimestamp > 0) {
    const delta = timestamp - lastTimestamp;
    if (delta > 32) {
      lastTimestamp = timestamp;
      requestAnimationFrame(gameLoop);
      return;
    }
  }
  lastTimestamp = timestamp;

  update();
  render();
  requestAnimationFrame(gameLoop);
}

/**
 * Update phase — dispatches to subsystems based on current state.
 */
export function update() {
  if (state.status === STATE.PLAYING) {
    // Ghost physics
    updateGhost(state.ghost);

    // Pipe management
    if (shouldSpawnPipe(state.pipes, CANVAS_WIDTH)) {
      state.pipes.push(createPipe(CANVAS_WIDTH, PLAYABLE_HEIGHT));
    }
    state.pipes = updatePipes(state.pipes);

    // Cloud parallax
    state.clouds = updateClouds(state.clouds, CANVAS_WIDTH);

    // Collision detection
    if (checkGhostCollisions(state.ghost, state.pipes, GROUND_Y, CANVAS_HEIGHT)) {
      state.status = STATE.GAME_OVER;
      state.gameOverTimestamp = Date.now();
      playGameOver(audio);
      if (state.score > state.highScore) {
        state.highScore = state.score;
      }
      saveHighScore(state.highScore);
      return;
    }

    // Score updates
    const points = checkScoreUpdate(state.ghost, state.pipes);
    if (points > 0) {
      state.score += points;
      if (state.score > state.highScore) {
        state.highScore = state.score;
      }
    }
  } else if (state.status === STATE.IDLE) {
    // Clouds still animate in IDLE
    state.clouds = updateClouds(state.clouds, CANVAS_WIDTH);
  }
}

/**
 * Render phase — draws all layers in correct order based on state.
 */
export function render() {
  // 1. Background
  renderBackground(ctx);
  // 2. Clouds
  renderClouds(ctx, state.clouds);
  // 3. Pipes
  renderPipes(ctx, state.pipes, GROUND_Y);
  // 4. Ground
  renderGround(ctx, GROUND_Y);
  // 5. Ghost (sprite or fallback)
  if (spriteLoaded && ghostSprite) {
    renderGhost(ctx, state.ghost, ghostSprite);
  } else {
    renderGhostFallback(ctx, state.ghost);
  }
  // 6. Score
  renderScore(ctx, state.score, state.highScore);
  // 7. Game over overlay
  if (state.status === STATE.GAME_OVER) {
    renderGameOver(ctx, state.score);
  }
}

/**
 * Handles player input with state-aware transitions.
 * IDLE → PLAYING with initial flap
 * PLAYING → flap + jump sound
 * GAME_OVER → restart after 500ms delay
 */
export function handleInput() {
  switch (state.status) {
    case STATE.IDLE:
      state.status = STATE.PLAYING;
      flapGhost(state.ghost);
      playJump(audio);
      break;

    case STATE.PLAYING:
      flapGhost(state.ghost);
      playJump(audio);
      break;

    case STATE.GAME_OVER:
      // Enforce 500ms restart delay
      if (Date.now() - state.gameOverTimestamp >= CONFIG.timing.restartDelay) {
        resetGame();
      }
      break;
  }
}

/**
 * Resets game state for a new session.
 * Clears pipes, resets ghost, zeroes score, enters PLAYING.
 */
export function resetGame() {
  stopAll(audio);
  state.ghost = createGhost();
  state.pipes = [];
  state.score = 0;
  state.gameOverTimestamp = null;
  state.status = STATE.PLAYING;
  flapGhost(state.ghost);
  playJump(audio);
}

// Export state getter for testability
export function getState() {
  return state;
}

// Auto-start on module load
init();
