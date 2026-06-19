# Game Mechanics

## Physics Constants

All physics values are defined in `game-config.json` and `src/config.js`. The game uses **per-frame physics** (not delta-time) at an assumed 60 FPS.

| Parameter | Per-Second | Per-Frame | Config Path |
|-----------|-----------|-----------|-------------|
| Gravity | 800 px/s² | 0.5 px/frame² | `CONFIG.ghost.gravity` |
| Jump Velocity | -300 px/s | -8 px/frame | `CONFIG.ghost.flapVelocity` |
| Max Fall Speed | — | 12 px/frame | `CONFIG.ghost.maxFallSpeed` |
| Wall/Pipe Speed | 120 px/s | 3 px/frame | `CONFIG.pipes.speed` |
| Gap Size | — | 140 px | `CONFIG.pipes.gapHeight` |
| Wall Spacing | — | 350 px | `CONFIG.pipes.spacing` |

### Frame-Based vs Time-Based
- This game uses per-frame physics for simplicity and retro feel
- On devices above/below 60 FPS, game speed varies — this is acceptable
- Tab backgrounding is handled by clamping delta to one frame's worth

## Movement Algorithms

### Ghost Vertical Movement
```javascript
function updateGhost(ghost) {
  // Apply gravity
  ghost.velocity += CONFIG.ghost.gravity;
  // Clamp to terminal velocity
  ghost.velocity = Math.min(ghost.velocity, CONFIG.ghost.maxFallSpeed);
  // Update position
  ghost.y += ghost.velocity;
  // Update rotation based on velocity
  ghost.rotation = calculateRotation(ghost.velocity);
  return ghost;
}
```

### Flap Impulse
```javascript
function flapGhost(ghost) {
  // Replace velocity entirely — not additive
  ghost.velocity = CONFIG.ghost.flapVelocity;
  return ghost;
}
```

### Rotation Mapping
```javascript
function calculateRotation(velocity) {
  // Map velocity range to rotation range [-30°, +90°]
  const t = (velocity - CONFIG.ghost.flapVelocity) /
            (CONFIG.ghost.maxFallSpeed - CONFIG.ghost.flapVelocity);
  const clamped = Math.max(0, Math.min(1, t));
  return CONFIG.ghost.minRotation + clamped * (CONFIG.ghost.maxRotation - CONFIG.ghost.minRotation);
}
```

### Pipe Scrolling
```javascript
function updatePipes(pipes) {
  for (const pipe of pipes) {
    pipe.x -= CONFIG.pipes.speed;
  }
  // Remove off-screen pipes
  return pipes.filter(p => p.x + p.width > 0);
}
```

### Pipe Spawning
```javascript
function shouldSpawnPipe(pipes, canvasWidth) {
  if (pipes.length === 0) return true;
  const last = pipes[pipes.length - 1];
  return last.x <= canvasWidth - CONFIG.pipes.spacing;
}

function createPipe(x, playableHeight) {
  const minY = playableHeight * CONFIG.pipes.gapMinPercent;
  const maxY = playableHeight * CONFIG.pipes.gapMaxPercent;
  const gapCenterY = minY + Math.random() * (maxY - minY);
  return { x, gapCenterY, gapHeight: CONFIG.pipes.gapHeight, width: 60, scored: false };
}
```

## Collision Detection Patterns

### AABB (Axis-Aligned Bounding Box)
```javascript
function checkAABBCollision(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}
```

### Ghost vs Pipes
- Get ghost bounding box
- For each pipe, compute top pipe bounds and bottom pipe bounds (excluding the gap)
- Check AABB overlap between ghost and each pipe section

### Boundary Collisions
```javascript
function checkBoundaryCollision(ghost, groundY) {
  // Ground collision
  if (ghost.y + ghost.height >= groundY) return true;
  // Ceiling collision
  if (ghost.y <= 0) return true;
  return false;
}
```

### Collision Response
- On collision: immediately transition to `GAME_OVER` state
- Stop all movement in the same frame
- No bounce or push-back — instant state change
- Play game over sound effect

### Gap Safety
- The gap region between top and bottom pipes is NOT collidable
- Only check against the top pipe (from canvas top to gap start) and bottom pipe (from gap end to ground)
