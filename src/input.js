/**
 * Input Handler module.
 * Unified input handling for mouse, keyboard, and touch.
 * Stateless — just sets up event listeners that call the provided callback.
 */

/**
 * Sets up unified input handling across mouse, keyboard, and touch.
 * All three input methods trigger the same onInput callback.
 *
 * @param {HTMLCanvasElement} canvas - The game canvas element
 * @param {() => void} onInput - Callback invoked on any valid player input
 */
export function setupInputHandler(canvas, onInput) {
  // Mouse click on canvas
  canvas.addEventListener('click', () => {
    onInput();
  });

  // Keyboard spacebar
  document.addEventListener('keydown', (e) => {
    if (e.key === ' ' || e.code === 'Space') {
      onInput();
    }
  });

  // Touch on canvas — prevent default to block scrolling
  canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    onInput();
  });
}
