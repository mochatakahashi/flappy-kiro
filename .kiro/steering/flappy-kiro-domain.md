# Flappy Kiro Domain

## Game State Management

### State Machine
The game uses three states with explicit transitions:

```
IDLE → PLAYING → GAME_OVER → PLAYING (loop)
```

| State | Description | Input Effect |
|-------|-------------|--------------|
| `IDLE` | Initial load, waiting for first input | Start game + first flap |
| `PLAYING` | Active gameplay, physics running | Flap ghost upward |
| `GAME_OVER` | Collision occurred, game frozen | Restart (after 500ms delay) |

### State Object Structure
```javascript
const gameState = {
  status: 'IDLE',           // 'IDLE' | 'PLAYING' | 'GAME_OVER'
  ghost: { x, y, velocity, width, height, rotation },
  pipes: [],                // Array of pipe objects
  clouds: [],              // Array of cloud objects
  score: 0,
  highScore: 0,
  gameOverTimestamp: null   // Set when entering GAME_OVER
};
```

### Transition Rules
- **IDLE → PLAYING**: Any input (click, spacebar, tap). Ghost performs initial flap.
- **PLAYING → GAME_OVER**: Collision detected (pipe, ground, or ceiling). Immediate freeze.
- **GAME_OVER → PLAYING**: Input received AND at least 500ms have elapsed since game over. Full reset.

### Reset Behavior
On restart:
- Score resets to 0
- Ghost returns to initial position (left third, vertically centered)
- All pipes removed
- Clouds persist (decorative, no gameplay impact)
- High score preserved (already persisted)
- Audio stopped from previous session

## Score Persistence

### Storage Strategy
- Use `localStorage` with key `flappyKiro_highScore`
- Store as string representation of integer
- Save on every game over (not during gameplay)

### Read Pattern
```javascript
function loadHighScore() {
  try {
    const raw = localStorage.getItem('flappyKiro_highScore');
    const parsed = parseInt(raw, 10);
    return (Number.isNaN(parsed) || parsed < 0) ? 0 : parsed;
  } catch {
    return 0;
  }
}
```

### Write Pattern
```javascript
function saveHighScore(score) {
  try {
    localStorage.setItem('flappyKiro_highScore', String(score));
  } catch {
    // Storage unavailable — silently continue
  }
}
```

### Validation Rules
- `null`, `undefined`, empty string → default to 0
- Negative numbers → default to 0
- Non-numeric strings → default to 0
- Floats → truncate to integer
- Valid non-negative integer → use as-is

### Display Format
```
Score: {current} | High: {highScore}
```
Always visible during gameplay, positioned above the ground area.

## Difficulty Progression

### Current Design: Fixed Difficulty
The initial spec uses fixed values — no difficulty scaling:
- Constant pipe speed (3 px/frame)
- Constant gap size (140 px)
- Constant pipe spacing (350 px)
- Constant gravity (0.5 px/frame²)

### Future Progression Patterns (Optional)

#### Speed Ramp
```javascript
function getPipeSpeed(score) {
  const baseSpeed = CONFIG.pipes.speed;
  const increment = 0.1;
  const maxSpeed = 6;
  return Math.min(baseSpeed + score * increment, maxSpeed);
}
```

#### Gap Shrink
```javascript
function getGapSize(score) {
  const baseGap = CONFIG.pipes.gapHeight;
  const shrinkPerPoint = 1;
  const minGap = 100;
  return Math.max(baseGap - score * shrinkPerPoint, minGap);
}
```

#### Spacing Reduction
```javascript
function getPipeSpacing(score) {
  const baseSpacing = CONFIG.pipes.spacing;
  const reductionPerPoint = 2;
  const minSpacing = 200;
  return Math.max(baseSpacing - score * reductionPerPoint, minSpacing);
}
```

### Difficulty Implementation Guidelines
- Keep difficulty functions pure: `score → parameter value`
- Define min/max bounds for all progressing values
- Changes should be gradual — player should not notice frame-to-frame differences
- Only add progression after core gameplay is polished and tested
- Test at extreme scores (100+) to ensure game remains playable

## Domain Events

| Event | Trigger | Effects |
|-------|---------|---------|
| Flap | Player input during PLAYING | Set velocity to -8, play jump sound |
| Score | Ghost passes pipe midpoint | Increment score, update high score if exceeded |
| Collision | Ghost overlaps pipe/ground/ceiling | Enter GAME_OVER, freeze physics, play sound, save high score |
| Restart | Input after 500ms in GAME_OVER | Reset state, enter PLAYING |
| Start | First input in IDLE | Enter PLAYING, perform initial flap |
