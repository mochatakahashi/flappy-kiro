import { CONFIG } from './config.js';

/**
 * Create a cloud with randomized properties.
 * @param {number} canvasWidth - Width of the canvas
 * @param {number} canvasHeight - Height of the canvas
 * @returns {object} Cloud object with x, y, width, height, speed, opacity
 */
export function createCloud(canvasWidth, canvasHeight) {
  const { minSpeed, maxSpeed, minOpacity, maxOpacity } = CONFIG.clouds;

  const width = 60 + Math.random() * 60;   // 60–120
  const height = 30 + Math.random() * 30;  // 30–60
  const x = Math.random() * canvasWidth;
  const y = Math.random() * (canvasHeight * 0.6); // upper 60% of canvas
  const speed = minSpeed + Math.random() * (maxSpeed - minSpeed);
  const opacity = minOpacity + Math.random() * (maxOpacity - minOpacity);

  return { x, y, width, height, speed, opacity };
}

/**
 * Update all clouds by scrolling left. Recycle clouds that move off-screen.
 * @param {object[]} clouds - Array of cloud objects
 * @param {number} canvasWidth - Width of the canvas
 * @returns {object[]} Updated clouds array
 */
export function updateClouds(clouds, canvasWidth) {
  const { minSpeed, maxSpeed, minOpacity, maxOpacity } = CONFIG.clouds;
  const canvasHeight = CONFIG.canvas.height;

  for (const cloud of clouds) {
    cloud.x -= cloud.speed;

    // Recycle cloud that scrolled off the left edge
    if (cloud.x + cloud.width < 0) {
      cloud.x = canvasWidth;
      cloud.y = Math.random() * (canvasHeight * 0.6); // new random Y in upper area
      cloud.width = 60 + Math.random() * 60;
      cloud.height = 30 + Math.random() * 30;
      cloud.speed = minSpeed + Math.random() * (maxSpeed - minSpeed);
      cloud.opacity = minOpacity + Math.random() * (maxOpacity - minOpacity);
    }
  }

  return clouds;
}
