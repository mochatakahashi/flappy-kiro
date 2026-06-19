# Implementation Plan: Flappy Kiro

## Overview

Build a retro-style Flappy Bird clone using HTML5 Canvas and vanilla JavaScript. The implementation follows a modular architecture with a centralized configuration module, state machine-driven game loop, and entity-based game objects. Testing uses Vitest with fast-check for property-based tests.

## Tasks

- [ ] 1. Set up project structure and configuration
  - [ ] 1.1 Create project scaffolding and config module
    - Create `src/` directory with all module files: `config.js`, `game.js`, `ghost.js`, `pipes.js`, `clouds.js`, `collision.js`, `scoring.js`, `audio.js`, `input.js`, `renderer.js`
    - Create `tests/` directory structure
    - Implement `config.js` with the full `CONFIG` object (canvas, ghost, pipes, clouds, scoring, timing groups)
    - Freeze the CONFIG object with `Object.freeze` for immutability
    - Create `index.html` entry point with canvas element and module script tag
    - Set up `package.json` with Vitest and fast-check as dev dependencies
    - Configure Vitest in `vitest.config.js` with jsdom environment
    - _Requirements: 9.1, 7.1, 7.3_

  - [ ] 1.2 Implement Ghost module (`src/ghost.js`)
    - Implement `createGhost()` returning ghost object at initial position (left third, vertically centered)
    - Implement `updateGhost(ghost)` applying gravity and clamping velocity to max fall speed
    - Implement `flapGhost(ghost)` setting velocity to flap impulse (-8)
    - Implement `getGhostBounds(ghost)` returning AABB bounding box
    - Implement rotation calculation based on velocity, clamped to [-30, 90] degrees
    - Import all constants from `CONFIG.ghost`
    - _Requirements: 2.1, 2.2, 2.4, 2.5, 1.2_

  - [ ]* 1.3 Write property tests for Ghost physics
    - **Property 1: Ghost velocity update applies gravity with terminal velocity**
    - **Property 2: Flap replaces current velocity**
    - **Property 3: Ghost rotation stays within bounds**
    - **Validates: Requirements 2.1, 2.2, 2.4, 2.5**

- [ ] 2. Implement Pipe and Cloud systems
  - [ ] 2.1 Implement Pipe Manager (`src/pipes.js`)
    - Implement `createPipe(x, playableHeight)` with randomized gap center between 20%-80% of playable height
    - Implement `updatePipes(pipes)` scrolling all pipes left at constant speed (3 px/frame)
    - Implement `shouldSpawnPipe(pipes, canvasWidth)` checking spacing threshold (300px)
    - Implement `getTopPipeBounds(pipe)` and `getBottomPipeBounds(pipe, playableHeight)` returning AABBs
    - Remove pipes that scroll off-screen (right edge < 0)
    - Pipe caps extend beyond body width by at least 10% each side
    - Import all constants from `CONFIG.pipes`
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 7.4_

  - [ ]* 2.2 Write property tests for Pipe system
    - **Property 4: Pipe creation invariants**
    - **Property 5: Pipe scrolling is constant speed**
    - **Property 6: Off-screen pipes are removed**
    - **Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 7.4**

  - [ ] 2.3 Implement Cloud Manager (`src/clouds.js`)
    - Implement `createCloud(canvasWidth, canvasHeight)` with randomized speed [0.5, 1.5] and opacity [0.3, 0.7]
    - Implement `updateClouds(clouds, canvasWidth)` scrolling clouds left and recycling off-screen clouds
    - Import speed/opacity ranges from `CONFIG.clouds`
    - _Requirements: 7.2_

  - [ ]* 2.4 Write property test for Cloud speed invariant
    - **Property 13: Cloud speed invariant**
    - **Validates: Requirements 7.2**

- [ ] 3. Implement Collision Detection and Scoring
  - [ ] 3.1 Implement Collision Detection (`src/collision.js`)
    - Implement `checkAABBCollision(a, b)` for axis-aligned bounding box overlap
    - Implement `checkGhostCollisions(ghost, pipes, groundY, canvasHeight)` checking pipe, ground, and ceiling collisions
    - Ground collision: ghost bottom edge >= groundY
    - Ceiling collision: ghost top edge <= 0
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

  - [ ]* 3.2 Write property tests for Collision Detection
    - **Property 7: AABB collision detection correctness**
    - **Property 8: Boundary collision detection**
    - **Validates: Requirements 4.2, 4.3, 4.4, 4.5**

  - [ ] 3.3 Implement Score Manager (`src/scoring.js`)
    - Implement `checkScoreUpdate(ghost, pipes)` incrementing score when ghost passes pipe midpoint (once per pipe)
    - Implement `loadHighScore()` reading from localStorage with validation (NaN/negative/missing → 0)
    - Implement `saveHighScore(score)` persisting to localStorage with try-catch for unavailable storage
    - Import storage key from `CONFIG.scoring`
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 1.3, 1.4_

  - [ ]* 3.4 Write property tests for Scoring
    - **Property 9: Score increments exactly once per pipe**
    - **Property 10: High score is monotonically non-decreasing**
    - **Property 11: Score display format**
    - **Property 12: High score localStorage validation**
    - **Validates: Requirements 5.1, 5.2, 5.3, 5.4, 5.5, 1.3, 1.4**

- [ ] 4. Checkpoint - Core logic verification
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 5. Implement Audio, Input, and Renderer
  - [ ] 5.1 Implement Audio Manager (`src/audio.js`)
    - Implement `createAudioManager()` loading jump.wav and game_over.wav with error handling
    - Implement `playJump(audio)` restarting playback from beginning if already playing
    - Implement `playGameOver(audio)` for collision feedback
    - Implement `stopAll(audio)` to stop playing audio on restart
    - Wrap all play() calls in try-catch; set references to null on load failure
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 2.3_

  - [ ] 5.2 Implement Input Handler (`src/input.js`)
    - Implement `setupInputHandler(canvas, onInput)` binding click, keydown (spacebar), and touchstart events
    - Ensure unified handling across mouse, keyboard, and touch
    - Prevent default on touch events to avoid scrolling
    - _Requirements: 1.5, 2.2, 6.4_

  - [ ] 5.3 Implement Renderer (`src/renderer.js`)
    - Implement `renderBackground(ctx)` drawing light blue background
    - Implement `renderClouds(ctx, clouds)` drawing semi-transparent rounded rectangles
    - Implement `renderPipes(ctx, pipes, groundY)` drawing green pipes with caps
    - Implement `renderGround(ctx, groundY)` drawing dark footer strip
    - Implement `renderGhost(ctx, ghost, sprite)` drawing rotated sprite
    - Implement `renderScore(ctx, score, highScore)` displaying "Score: X | High: Y"
    - Implement `renderGameOver(ctx, score)` displaying centered overlay
    - Render in correct layer order: background → clouds → pipes → ground → ghost → score
    - Import canvas dimensions from `CONFIG.canvas`
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 5.2, 6.3_

- [ ] 6. Implement Game Controller and State Machine
  - [ ] 6.1 Implement Game Controller (`src/game.js`)
    - Implement `init()` to set up canvas at 800×600, load ghost sprite, initialize state
    - Implement state machine with IDLE, PLAYING, GAME_OVER states
    - Implement `gameLoop(timestamp)` with requestAnimationFrame
    - Implement `update()` calling ghost, pipe, cloud, collision, and score updates per state
    - Implement `render()` calling renderer functions in correct order per state
    - Implement `handleInput()` with state-aware transitions (IDLE→PLAYING, flap in PLAYING, restart in GAME_OVER)
    - Implement `resetGame()` clearing pipes, resetting ghost position, zeroing score
    - Enforce 500ms restart delay after entering GAME_OVER
    - Handle tab backgrounding with delta-time clamping
    - _Requirements: 1.1, 1.2, 1.5, 6.1, 6.2, 6.3, 6.4, 6.5_

  - [ ]* 6.2 Write property test for restart delay guard
    - **Property 14: Restart delay guard**
    - **Validates: Requirements 6.5**

  - [ ] 6.3 Implement responsive canvas scaling
    - Apply CSS `object-fit: contain` for aspect ratio preservation
    - Center canvas horizontally and vertically in viewport
    - Handle window resize events within the animation frame cycle
    - Ensure minimum scale at viewport < 300×225 without cropping
    - _Requirements: 9.1, 9.2, 9.3, 9.4_

  - [ ]* 6.4 Write property test for canvas scaling
    - **Property 15: Canvas scaling preserves aspect ratio**
    - **Validates: Requirements 9.2**

- [ ] 7. Integration and final wiring
  - [ ] 7.1 Wire all modules together in index.html
    - Connect all module imports in `game.js`
    - Ensure `index.html` loads `game.js` as ES module
    - Verify asset paths resolve correctly for ghosty.png, jump.wav, game_over.wav
    - Add fallback rendering (colored rectangle) if ghost sprite fails to load
    - Add 5-second asset loading timeout
    - Add canvas support check with "Browser not supported" message
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 7.5, 8.3_

  - [ ]* 7.2 Write integration tests
    - Test full game cycle: start → play → hit pipe → game over → restart → verify clean state
    - Test localStorage round-trip: save high score → reload → verify persisted value
    - Test state transitions: IDLE → PLAYING → GAME_OVER → PLAYING
    - _Requirements: 1.5, 5.4, 6.4, 6.5_

- [ ] 8. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- All game constants are sourced from `src/config.js` — no magic numbers in other modules
- The game uses per-frame physics (not delta-time), matching the retro style specification
- Audio failures are non-blocking; the game continues without sound if audio is unavailable

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["1.2", "2.1", "2.3", "3.1", "3.3"] },
    { "id": 2, "tasks": ["1.3", "2.2", "2.4", "3.2", "3.4"] },
    { "id": 3, "tasks": ["5.1", "5.2", "5.3"] },
    { "id": 4, "tasks": ["6.1", "6.3"] },
    { "id": 5, "tasks": ["6.2", "6.4"] },
    { "id": 6, "tasks": ["7.1"] },
    { "id": 7, "tasks": ["7.2"] }
  ]
}
```
