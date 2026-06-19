import { CONFIG } from './config.js';

const { width: CANVAS_WIDTH, height: CANVAS_HEIGHT } = CONFIG.canvas;

/**
 * Renders the light blue background across the full canvas.
 */
export function renderBackground(ctx) {
  ctx.fillStyle = '#87CEEB';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
}

/**
 * Renders semi-transparent rounded-rectangle clouds.
 */
export function renderClouds(ctx, clouds) {
  for (const cloud of clouds) {
    ctx.save();
    ctx.globalAlpha = cloud.opacity;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.roundRect(cloud.x, cloud.y, cloud.width, cloud.height, 10);
    ctx.fill();
    ctx.restore();
  }
}

/**
 * Renders green pipes with caps at the gap-facing end.
 * Top pipe: cap at bottom. Bottom pipe: cap at top.
 */
export function renderPipes(ctx, pipes, groundY) {
  const capOverhang = CONFIG.pipes.capOverhangPercent;

  for (const pipe of pipes) {
    const capWidth = pipe.width * (1 + 2 * capOverhang);
    const capHeight = pipe.capHeight || 20;
    const capX = pipe.x - (capWidth - pipe.width) / 2;

    const gapTop = pipe.gapCenterY - pipe.gapHeight / 2;
    const gapBottom = pipe.gapCenterY + pipe.gapHeight / 2;

    // --- Top pipe body ---
    ctx.fillStyle = '#2ecc40';
    ctx.fillRect(pipe.x, 0, pipe.width, gapTop);

    // Top pipe cap (at bottom of top pipe, gap-facing end)
    ctx.fillStyle = '#27ae35';
    ctx.fillRect(capX, gapTop - capHeight, capWidth, capHeight);

    // --- Bottom pipe body ---
    ctx.fillStyle = '#2ecc40';
    ctx.fillRect(pipe.x, gapBottom, pipe.width, groundY - gapBottom);

    // Bottom pipe cap (at top of bottom pipe, gap-facing end)
    ctx.fillStyle = '#27ae35';
    ctx.fillRect(capX, gapBottom, capWidth, capHeight);
  }
}

/**
 * Renders the dark ground footer strip.
 */
export function renderGround(ctx, groundY) {
  ctx.fillStyle = '#3d3d3d';
  ctx.fillRect(0, groundY, CANVAS_WIDTH, CANVAS_HEIGHT - groundY);
}

/**
 * Renders the ghost sprite with rotation using canvas transforms.
 */
export function renderGhost(ctx, ghost, sprite) {
  ctx.save();
  ctx.translate(ghost.x + ghost.width / 2, ghost.y + ghost.height / 2);
  ctx.rotate(ghost.rotation * Math.PI / 180);
  ctx.drawImage(sprite, -ghost.width / 2, -ghost.height / 2, ghost.width, ghost.height);
  ctx.restore();
}

/**
 * Renders the score and high score text above the ground area.
 */
export function renderScore(ctx, score, highScore) {
  ctx.fillStyle = '#ffffff';
  ctx.font = '20px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(
    `Score: ${score} | High: ${highScore}`,
    CANVAS_WIDTH / 2,
    CANVAS_HEIGHT - CANVAS_HEIGHT * CONFIG.canvas.groundHeightPercent - 10
  );
}

/**
 * Renders the game over overlay with a semi-transparent background and centered text.
 */
export function renderGameOver(ctx, score) {
  // Semi-transparent black overlay
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // "Game Over" title
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 48px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('Game Over', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 30);

  // Final score
  ctx.font = '24px monospace';
  ctx.fillText(`Score: ${score}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 20);
}
