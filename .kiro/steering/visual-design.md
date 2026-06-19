# Visual Design

## Sprite Rendering Patterns

### Ghost Sprite
- Load from `assets/ghosty.png`
- Render at fixed dimensions regardless of game state
- Apply rotation via canvas transform (translate to center, rotate, draw offset)
- Fallback: render a colored rectangle if sprite fails to load

```javascript
function renderGhost(ctx, ghost, sprite) {
  ctx.save();
  ctx.translate(ghost.x + ghost.width / 2, ghost.y + ghost.height / 2);
  ctx.rotate((ghost.rotation * Math.PI) / 180);
  ctx.drawImage(sprite, -ghost.width / 2, -ghost.height / 2, ghost.width, ghost.height);
  ctx.restore();
}
```

### Pipe Rendering
- Green rectangles with a cap section at the opening end
- Cap extends beyond pipe body width by at least 10% on each side
- Top pipes: cap at the bottom (gap-facing end)
- Bottom pipes: cap at the top (gap-facing end)
- Use `ctx.fillRect` for body and cap — no images needed

```javascript
function renderPipe(ctx, pipe, isTop, groundY) {
  const capWidth = pipe.width * (1 + 2 * CONFIG.pipes.capOverhangPercent);
  const capHeight = 20;
  const capX = pipe.x - (capWidth - pipe.width) / 2;

  // Draw pipe body
  ctx.fillStyle = '#2ecc40';
  if (isTop) {
    ctx.fillRect(pipe.x, 0, pipe.width, pipe.gapCenterY - pipe.gapHeight / 2);
    // Cap at bottom of top pipe
    ctx.fillStyle = '#27ae35';
    ctx.fillRect(capX, pipe.gapCenterY - pipe.gapHeight / 2 - capHeight, capWidth, capHeight);
  }
}
```

## Animation Systems

### Rotation Animation
- Ghost rotates smoothly between -30° (flapping up) and +90° (falling down)
- Rotation is derived from velocity each frame — not interpolated over time
- This gives immediate visual feedback on player input

### Cloud Parallax
- Multiple clouds at varying speeds (0.5–1.5 px/frame) simulate depth
- Slower clouds appear farther away
- Clouds recycle when they scroll off the left edge — reappear on the right with new random Y

### Layer Order (back to front)
1. Background (solid light blue fill)
2. Clouds (semi-transparent white rounded rectangles)
3. Pipes (green with caps)
4. Ground (dark footer strip)
5. Ghost (rotated sprite)
6. Score display (text overlay)
7. Game over overlay (when in GAME_OVER state)

## Particle Effect Guidelines

### Design Philosophy
- Keep effects minimal for retro aesthetic
- No heavy particle systems — this is a simple canvas game
- Visual feedback should be quick and non-distracting

### Potential Effects (Optional Enhancements)
- **Flap dust**: 2-3 small white circles emitted downward on flap, fade in 10 frames
- **Score pop**: Brief scale-up animation on the score text when incremented
- **Game over flash**: Single-frame white overlay at 50% opacity on collision

### Implementation Pattern
```javascript
// Simple particle: position, velocity, lifetime
function createParticle(x, y) {
  return { x, y, vx: (Math.random() - 0.5) * 2, vy: Math.random() * 2, life: 10 };
}

function updateParticles(particles) {
  for (const p of particles) {
    p.x += p.vx;
    p.y += p.vy;
    p.life--;
  }
  return particles.filter(p => p.life > 0);
}
```

### Performance Rules for Effects
- Cap particle count (max 10 active at once)
- Use simple shapes (circles, rectangles) — no images for particles
- Remove particles immediately when lifetime expires
- Do not allocate in the render path; pre-allocate a particle pool

## Color Palette

| Element | Color | Hex |
|---------|-------|-----|
| Background | Light blue | `#87CEEB` |
| Ground | Dark brown/gray | `#3d3d3d` |
| Pipe body | Green | `#2ecc40` |
| Pipe cap | Darker green | `#27ae35` |
| Clouds | White (semi-transparent) | `rgba(255, 255, 255, 0.3–0.7)` |
| Score text | White | `#ffffff` |
| Game over overlay | Black (semi-transparent) | `rgba(0, 0, 0, 0.7)` |

## Canvas Scaling
- Fixed logical resolution: 800×600
- CSS `object-fit: contain` for viewport adaptation
- Center horizontally and vertically
- All coordinates are in logical pixels — never reference display pixels in game logic
