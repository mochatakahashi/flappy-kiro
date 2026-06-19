# Game Coding Standards

## JavaScript Game Patterns

### Module Structure
- Use ES modules (`export`/`import`) for all game code
- One concern per file: physics, rendering, input, audio, scoring
- No default exports — use named exports for clarity
- Keep modules stateless where possible; pass state as arguments

### Game Loop Pattern
```javascript
function gameLoop(timestamp) {
  update(state);
  render(state);
  requestAnimationFrame(gameLoop);
}
```
- Use `requestAnimationFrame` for the main loop
- Separate update (logic) from render (drawing) phases
- Never mix DOM manipulation with canvas rendering in the same function

### State Management
- Use a single `GameState` object as the source of truth
- State transitions happen through explicit functions, not direct mutation from event handlers
- Use a state machine pattern for game flow: `IDLE → PLAYING → GAME_OVER`

### Configuration
- All magic numbers live in `config.js` (or `game-config.json`) — never inline constants
- Import from a single config module; do not duplicate values across files
- Freeze config objects in production to catch accidental mutation

## Class and Naming Conventions

### Naming Rules
- **Files**: kebab-case (`ghost-entity.js`, `pipe-manager.js`)
- **Classes**: PascalCase (`GhostEntity`, `PipeManager`)
- **Functions**: camelCase, verb-first (`createGhost`, `updatePipes`, `checkCollision`)
- **Constants**: UPPER_SNAKE_CASE only for true constants (`MAX_FALL_SPEED`), otherwise use config paths
- **Interfaces/Types** (in docs): prefix with capital letter, descriptive (`BoundingBox`, `GameState`)

### Entity Pattern
```javascript
// Entities are plain objects with positional and behavioral properties
function createGhost() {
  return { x, y, velocity, width, height, rotation };
}

// Update functions are pure: take entity, return updated entity
function updateGhost(ghost) {
  // apply physics
  return ghost;
}
```

### Bounding Box Convention
```javascript
// All collidable entities expose bounds via a getter function
function getEntityBounds(entity) {
  return { x: entity.x, y: entity.y, width: entity.width, height: entity.height };
}
```

## Performance Optimization Guidelines

### Canvas Rendering
- Minimize canvas state changes (`save()`/`restore()` calls)
- Batch similar draw operations (all pipes together, all clouds together)
- Use `ctx.translate` + `ctx.rotate` for sprite rotation instead of manual matrix math
- Clear only the full canvas once per frame with `clearRect`
- Avoid creating new objects in the render loop; reuse geometry objects

### Memory Management
- Object pool pipes and clouds instead of creating/destroying each frame
- Remove off-screen entities promptly (pipes past left edge)
- Avoid closures in hot paths (update/render loops)
- Pre-compute values that don't change per frame (ground Y, playable height)

### Audio
- Preload all audio assets on init
- Reuse `HTMLAudioElement` instances; reset `currentTime` instead of creating new elements
- Wrap `play()` in try-catch — never let audio errors break the game loop

### General
- Avoid DOM queries inside the game loop
- Cache `canvas.width`, `canvas.height` in variables
- Use `Math.min`/`Math.max` for clamping instead of conditional branches
- Prefer bitwise `| 0` or `Math.trunc` for integer conversion in hot paths
