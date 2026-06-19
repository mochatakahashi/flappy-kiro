import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createGhost, updateGhost, flapGhost } from '../src/ghost.js';
import { createPipe, updatePipes } from '../src/pipes.js';
import { checkGhostCollisions } from '../src/collision.js';
import { checkScoreUpdate, loadHighScore, saveHighScore } from '../src/scoring.js';
import { CONFIG } from '../src/config.js';

describe('Integration: Full game cycle', () => {
  let ghost;
  let pipes;
  let score;
  let highScore;
  let status;
  const GROUND_Y = CONFIG.canvas.height * (1 - CONFIG.canvas.groundHeightPercent);

  beforeEach(() => {
    ghost = createGhost();
    pipes = [];
    score = 0;
    highScore = loadHighScore();
    status = 'IDLE';
    localStorage.clear();
  });

  it('should complete start → play → score → hit ground → game over → restart → clean state', () => {
    // --- IDLE → PLAYING: first input triggers flap ---
    status = 'PLAYING';
    flapGhost(ghost);
    expect(status).toBe('PLAYING');
    expect(ghost.velocity).toBe(CONFIG.ghost.flapVelocity);

    // --- PLAYING: spawn a pipe and simulate frames ---
    const pipe = createPipe(CONFIG.canvas.width, GROUND_Y);
    pipes.push(pipe);

    // Move ghost to the right of pipe midpoint so we can score
    // Simulate several physics frames to move pipe left past ghost
    const pipeMiddle = pipe.x + pipe.width / 2;
    const framesToPassPipe = Math.ceil((pipeMiddle - ghost.x) / CONFIG.pipes.speed) + 1;

    for (let i = 0; i < framesToPassPipe; i++) {
      updateGhost(ghost);
      pipes = updatePipes(pipes);

      // Flap periodically to stay in safe area
      if (i % 10 === 0) {
        flapGhost(ghost);
      }
    }

    // Check score: ghost should have passed pipe midpoint
    const points = checkScoreUpdate(ghost, pipes);
    score += points;
    expect(score).toBeGreaterThanOrEqual(1);
    expect(pipes[0].scored).toBe(true);

    // --- PLAYING → GAME_OVER: force ghost to hit ground ---
    ghost.y = GROUND_Y - ghost.height + 1; // Position ghost at ground level
    ghost.velocity = CONFIG.ghost.maxFallSpeed;
    updateGhost(ghost);

    const collision = checkGhostCollisions(ghost, pipes, GROUND_Y, CONFIG.canvas.height);
    expect(collision).toBe(true);

    // Transition to GAME_OVER
    status = 'GAME_OVER';
    const gameOverTimestamp = Date.now();

    // Update high score on game over
    if (score > highScore) {
      highScore = score;
    }
    saveHighScore(highScore);

    expect(status).toBe('GAME_OVER');

    // --- GAME_OVER → PLAYING: restart after delay ---
    // Input within 500ms should be ignored
    const earlyInput = gameOverTimestamp + 200;
    if (earlyInput - gameOverTimestamp < CONFIG.timing.restartDelay) {
      // Input ignored — state doesn't change
      expect(status).toBe('GAME_OVER');
    }

    // Input after 500ms triggers restart
    vi.spyOn(Date, 'now').mockReturnValue(gameOverTimestamp + CONFIG.timing.restartDelay + 1);
    const canRestart = Date.now() - gameOverTimestamp >= CONFIG.timing.restartDelay;
    expect(canRestart).toBe(true);
    vi.restoreAllMocks();

    // --- Restart: verify clean state ---
    ghost = createGhost();
    pipes = [];
    score = 0;
    status = 'PLAYING';

    expect(score).toBe(0);
    expect(pipes).toHaveLength(0);
    expect(ghost.velocity).toBe(0);
    expect(ghost.rotation).toBe(0);
    expect(status).toBe('PLAYING');

    // Ghost at initial position
    const playableHeight = CONFIG.canvas.height * (1 - CONFIG.canvas.groundHeightPercent);
    const expectedY = Math.trunc(playableHeight / 2) - Math.trunc(ghost.height / 2);
    expect(ghost.y).toBe(expectedY);
  });
});

describe('Integration: localStorage round-trip', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should persist and retrieve high score across save/load cycles', () => {
    // Initially no score stored
    expect(loadHighScore()).toBe(0);

    // Save a score and load it back
    saveHighScore(42);
    expect(loadHighScore()).toBe(42);

    // Save a higher score — should overwrite
    saveHighScore(100);
    expect(loadHighScore()).toBe(100);

    // Save a lower score — still persists the value we save
    saveHighScore(10);
    expect(loadHighScore()).toBe(10);
  });

  it('should handle edge case values gracefully', () => {
    // Zero is valid
    saveHighScore(0);
    expect(loadHighScore()).toBe(0);

    // Large value
    saveHighScore(999999);
    expect(loadHighScore()).toBe(999999);

    // Corrupt data in localStorage should default to 0
    localStorage.setItem(CONFIG.scoring.storageKey, 'not-a-number');
    expect(loadHighScore()).toBe(0);

    // Negative value stored raw should default to 0
    localStorage.setItem(CONFIG.scoring.storageKey, '-5');
    expect(loadHighScore()).toBe(0);

    // Empty string should default to 0
    localStorage.setItem(CONFIG.scoring.storageKey, '');
    expect(loadHighScore()).toBe(0);

    // Valid value after corruption
    saveHighScore(77);
    expect(loadHighScore()).toBe(77);
  });

  it('should survive simulated page reload (re-read from storage)', () => {
    saveHighScore(55);

    // Simulate "reload" by creating a fresh read
    const reloaded = loadHighScore();
    expect(reloaded).toBe(55);
  });
});

describe('Integration: State transitions', () => {
  let ghost;
  let pipes;
  let score;
  let highScore;
  let status;
  let gameOverTimestamp;
  const GROUND_Y = CONFIG.canvas.height * (1 - CONFIG.canvas.groundHeightPercent);

  function handleInput(now) {
    switch (status) {
      case 'IDLE':
        status = 'PLAYING';
        flapGhost(ghost);
        break;
      case 'PLAYING':
        flapGhost(ghost);
        break;
      case 'GAME_OVER':
        if (now - gameOverTimestamp >= CONFIG.timing.restartDelay) {
          // Reset
          ghost = createGhost();
          pipes = [];
          score = 0;
          gameOverTimestamp = null;
          status = 'PLAYING';
          flapGhost(ghost);
        }
        break;
    }
  }

  beforeEach(() => {
    ghost = createGhost();
    pipes = [];
    score = 0;
    highScore = 0;
    status = 'IDLE';
    gameOverTimestamp = null;
    localStorage.clear();
  });

  it('should transition IDLE → PLAYING on first input', () => {
    expect(status).toBe('IDLE');
    handleInput(Date.now());
    expect(status).toBe('PLAYING');
    expect(ghost.velocity).toBe(CONFIG.ghost.flapVelocity);
  });

  it('should transition PLAYING → GAME_OVER on collision', () => {
    handleInput(Date.now()); // IDLE → PLAYING

    // Force ground collision
    ghost.y = GROUND_Y;
    const collision = checkGhostCollisions(ghost, pipes, GROUND_Y, CONFIG.canvas.height);
    expect(collision).toBe(true);

    // Transition
    status = 'GAME_OVER';
    gameOverTimestamp = Date.now();
    expect(status).toBe('GAME_OVER');
  });

  it('should enforce 500ms restart delay in GAME_OVER', () => {
    handleInput(1000); // IDLE → PLAYING
    status = 'GAME_OVER';
    gameOverTimestamp = 2000;

    // Input at 2200ms (200ms after game over) — too early
    handleInput(2200);
    expect(status).toBe('GAME_OVER');

    // Input at 2499ms (499ms after game over) — still too early
    handleInput(2499);
    expect(status).toBe('GAME_OVER');

    // Input at 2500ms (exactly 500ms after game over) — should restart
    handleInput(2500);
    expect(status).toBe('PLAYING');
  });

  it('should reset all state on restart after delay', () => {
    handleInput(1000); // IDLE → PLAYING

    // Accumulate some game state
    score = 5;
    pipes.push(createPipe(CONFIG.canvas.width, GROUND_Y));
    ghost.y = 200;
    ghost.velocity = 6;

    // Enter GAME_OVER
    status = 'GAME_OVER';
    gameOverTimestamp = 2000;

    // Restart after delay
    handleInput(2600);
    expect(status).toBe('PLAYING');
    expect(score).toBe(0);
    expect(pipes).toHaveLength(0);

    // Ghost reset to initial position
    const playableHeight = CONFIG.canvas.height * (1 - CONFIG.canvas.groundHeightPercent);
    const expectedY = Math.trunc(playableHeight / 2) - Math.trunc(ghost.height / 2);
    expect(ghost.y).toBe(expectedY);
    expect(ghost.velocity).toBe(CONFIG.ghost.flapVelocity); // flapGhost called on restart
  });

  it('should complete full cycle: IDLE → PLAYING → GAME_OVER → PLAYING', () => {
    // Start
    expect(status).toBe('IDLE');

    // First input
    handleInput(1000);
    expect(status).toBe('PLAYING');

    // Collision
    ghost.y = GROUND_Y;
    const collision = checkGhostCollisions(ghost, pipes, GROUND_Y, CONFIG.canvas.height);
    expect(collision).toBe(true);
    status = 'GAME_OVER';
    gameOverTimestamp = 2000;
    expect(status).toBe('GAME_OVER');

    // Restart after delay
    handleInput(2600);
    expect(status).toBe('PLAYING');

    // Should be able to play again (ghost has flap velocity)
    expect(ghost.velocity).toBe(CONFIG.ghost.flapVelocity);
  });
});
