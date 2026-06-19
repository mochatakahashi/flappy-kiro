# Requirements Document

## Introduction

Flappy Kiro is a retro-style endless side-scroller browser game built with HTML, CSS, and JavaScript. The player controls a ghost character that must navigate through gaps between green pipes scrolling from right to left. The game features gravity-based physics, score tracking, sound effects, and a retro art style with a light blue background and cloud decorations.

## Glossary

- **Game_Canvas**: The HTML5 canvas element that renders the game visuals
- **Ghost**: The player-controlled character rendered from the ghosty.png sprite asset
- **Pipe**: A green rectangular obstacle that appears in pairs (top and bottom) with a navigable gap between them
- **Pipe_Gap**: The vertical space between a top pipe and a bottom pipe through which the Ghost must pass
- **Score_Display**: The UI element at the bottom of the screen showing the current score and high score
- **Game_Loop**: The continuous rendering and update cycle that drives the game at a consistent frame rate
- **Ground**: The dark footer area at the bottom of the game screen that acts as a boundary
- **Cloud**: A semi-transparent white rounded-rectangle decoration element in the background, rendered at varying speeds to simulate depth
- **High_Score**: The highest score achieved across all play sessions, persisted in browser local storage
- **Game_Over_State**: The state entered when the Ghost collides with a Pipe, the Ground, or the top boundary

## Requirements

### Requirement 1: Game Initialization

**User Story:** As a player, I want the game to load and display a start screen, so that I can begin playing when ready.

#### Acceptance Criteria

1. WHEN the page loads, THE Game_Canvas SHALL render the light blue background, Cloud decorations, and the Ground area
2. WHEN the page loads, THE Game_Canvas SHALL display the Ghost at a centered vertical position on the left third of the screen
3. WHEN the page loads, THE Score_Display SHALL show "Score: 0 | High: X" where X is the persisted High_Score value retrieved from browser local storage
4. IF the persisted High_Score is not found or is not a valid non-negative integer, THEN THE Score_Display SHALL default High_Score to zero
5. WHEN the player clicks the mouse, presses the spacebar, or taps the screen before gameplay starts, THE Game_Loop SHALL begin and the Ghost SHALL perform an initial upward flap

### Requirement 2: Ghost Physics and Control

**User Story:** As a player, I want to control the ghost's vertical movement, so that I can navigate through pipe gaps.

#### Acceptance Criteria

1. WHILE the Game_Loop is running, THE Ghost SHALL accelerate downward due to gravity at a constant rate of 0.5 pixels per frame squared
2. WHEN the player clicks the mouse, presses the spacebar, or taps the screen, THE Ghost SHALL receive an upward velocity impulse of -8 pixels per frame, replacing the current vertical velocity
3. WHEN the player clicks the mouse, presses the spacebar, or taps the screen, THE Game_Canvas SHALL play the jump.wav sound effect
4. THE Ghost's vertical velocity SHALL be clamped to a maximum downward speed of 12 pixels per frame to prevent tunneling through obstacles
5. WHILE the Game_Loop is running, THE Ghost SHALL rotate between -30 degrees (upward flap) and +90 degrees (falling) based on the current vertical velocity

### Requirement 3: Pipe Generation and Scrolling

**User Story:** As a player, I want pipes to appear and scroll across the screen, so that there are obstacles to navigate through.

#### Acceptance Criteria

1. WHILE the Game_Loop is running, THE Game_Canvas SHALL generate new Pipe pairs at a fixed horizontal interval of 300 pixels apart, spawning each new pair off the right edge of the screen
2. WHILE the Game_Loop is running, THE Game_Canvas SHALL scroll all Pipes from right to left at a constant speed of 3 pixels per frame
3. THE Game_Canvas SHALL render each Pipe pair with a randomized vertical Pipe_Gap center position constrained between 20% and 80% of the playable area height (excluding the Ground)
4. THE Game_Canvas SHALL size each Pipe_Gap to a fixed height of 150 pixels, providing consistent clearance for the Ghost to pass through
5. WHEN a Pipe pair scrolls completely off the left edge of the screen (x position plus pipe width is less than zero), THE Game_Loop SHALL remove that Pipe pair from the active Pipe collection

### Requirement 4: Collision Detection

**User Story:** As a player, I want the game to detect when my ghost hits an obstacle, so that the game ends on collision.

#### Acceptance Criteria

1. WHILE the Game_Loop is running, THE Game_Loop SHALL check for collisions between the Ghost bounding box and all Pipe bounding boxes, the Ground top edge, and the top edge of the Game_Canvas on every frame
2. WHEN the Ghost bounding box overlaps with any Pipe bounding box (excluding the Pipe_Gap region), THE Game_Loop SHALL transition to the Game_Over_State within the same frame
3. WHEN the bottom edge of the Ghost bounding box reaches or exceeds the top edge of the Ground, THE Game_Loop SHALL transition to the Game_Over_State within the same frame
4. WHEN the top edge of the Ghost bounding box reaches or exceeds the top edge of the Game_Canvas (y position less than or equal to zero), THE Game_Loop SHALL transition to the Game_Over_State within the same frame
5. WHILE the Ghost is passing through the Pipe_Gap region without contacting either Pipe bounding box, THE Game_Loop SHALL NOT trigger a collision

### Requirement 5: Scoring

**User Story:** As a player, I want to earn points for passing through pipes, so that I can track my progress.

#### Acceptance Criteria

1. WHEN the Ghost's horizontal position passes the horizontal midpoint of a Pipe pair, THE Score_Display SHALL increment the current score by one, and SHALL count each Pipe pair only once regardless of subsequent frames where the Ghost remains past the midpoint
2. THE Score_Display SHALL render the current score and High_Score in the format "Score: X | High: Y" above the Ground area at the bottom of the Game_Canvas, visible at all times during gameplay
3. WHEN the current score exceeds the High_Score, THE Game_Loop SHALL update the High_Score to match the current score
4. WHEN the Game_Over_State is entered, THE Game_Loop SHALL persist the High_Score to browser local storage so the value survives page reloads
5. IF browser local storage is unavailable or the stored High_Score value is not a valid non-negative integer, THEN THE Game_Loop SHALL default the High_Score to zero and continue gameplay without persistence

### Requirement 6: Game Over and Restart

**User Story:** As a player, I want to see my final score and restart the game after a collision, so that I can try again.

#### Acceptance Criteria

1. WHEN the Game_Over_State is entered, THE Game_Loop SHALL stop all Pipe scrolling and Ghost physics within the same frame as the collision
2. WHEN the Game_Over_State is entered, THE Game_Canvas SHALL play the game_over.wav sound effect
3. WHEN the Game_Over_State is entered, THE Game_Canvas SHALL display a "Game Over" overlay message centered on the screen with the final score value
4. WHEN the player clicks the mouse, presses the spacebar, or taps the screen during Game_Over_State, THE Game_Loop SHALL reset the score to zero, reposition the Ghost to the initial start position, remove all Pipes from the screen, and restart gameplay
5. WHEN gameplay restarts from Game_Over_State, THE Game_Loop SHALL wait a minimum of 500 milliseconds after entering Game_Over_State before accepting restart input to prevent accidental immediate restarts

### Requirement 7: Background and Visual Style

**User Story:** As a player, I want the game to have a retro visual style, so that the experience feels polished and engaging.

#### Acceptance Criteria

1. THE Game_Canvas SHALL render a light blue background color across the full play area
2. WHILE the Game_Loop is running, THE Game_Canvas SHALL scroll semi-transparent white rounded-rectangle Cloud decorations from right to left at varying speeds between 0.5 and 1.5 pixels per frame, assigning each Cloud a randomized speed upon creation to simulate parallax depth through perceived differences in distance
3. THE Game_Canvas SHALL render the Ground as a visually distinct dark-colored footer strip occupying between 5% and 15% of the Game_Canvas height at the bottom of the screen
4. THE Game_Canvas SHALL render Pipes as green rectangles with a cap section at the opening end that extends beyond the pipe body width by at least 10% on each side
5. THE Game_Canvas SHALL render the Ghost using the ghosty.png sprite asset at fixed dimensions that remain unchanged throughout gameplay regardless of game state
6. THE Game_Canvas SHALL render visual elements in back-to-front layer order: background, Clouds, Pipes, Ground, Ghost, Score_Display

### Requirement 8: Sound Effects

**User Story:** As a player, I want audio feedback for key actions, so that the gameplay feels responsive.

#### Acceptance Criteria

1. WHEN the player triggers a flap input, THE Game_Canvas SHALL play the jump.wav audio file from the assets folder, restarting playback from the beginning if the sound is already playing
2. WHEN the Game_Over_State is entered, THE Game_Canvas SHALL play the game_over.wav audio file from the assets folder
3. IF an audio file fails to load or decode, THEN THE Game_Canvas SHALL continue gameplay without sound rather than blocking execution
4. WHEN the Game_Loop is reset from Game_Over_State, THE Game_Canvas SHALL stop any currently playing audio from the previous session

### Requirement 9: Responsive Canvas

**User Story:** As a player, I want the game to display properly in my browser window, so that I can play without layout issues.

#### Acceptance Criteria

1. THE Game_Canvas SHALL render at a fixed logical resolution of 800×600 pixels to maintain consistent gameplay physics regardless of display size
2. THE Game_Canvas SHALL scale to fit within the browser viewport while preserving its aspect ratio and centering horizontally and vertically within the available space
3. WHEN the browser window is resized, THE Game_Canvas SHALL adjust its display size within the same animation frame cycle, without pausing, restarting, or dropping the Game_Loop
4. IF the browser viewport dimensions are smaller than 300×225 pixels, THEN THE Game_Canvas SHALL render at the minimum scale without cropping game content
