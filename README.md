# Snake Game

A classic Snake game built with HTML, CSS, and JavaScript featuring player name input, score tracking, persistent high scores, immersive animations, and a left-side menu for quick Pause/Quit.

## Features

- **Player Name Input**: Players must enter their name before starting the game
- **Board Between Bars**: Game board sits strictly between a top scoreboard and bottom statusbar (never overlaps)
- **Responsive Board Sizing**: Centered canvas with modern max width; auto-resizes while preserving crisp grid alignment
- **Left Sidebar Controls**: Always-visible Pause and Quit buttons placed just under the top scoreboard for easy access
- **Live Snake Animations**: Realistic snake movement with slither effects, glowing head, and animated body
- **Real-time Scoreboard**: Shows current score and high score during gameplay
- **Score Tracking**: 
  - Uses sessionStorage to track score during the current game session
  - Uses localStorage to persist the highest score across browser sessions
- **Game Over Effects**: Dramatic game over animation with sound effects
- **Responsive Design**: Works on both desktop and mobile devices; on small screens, board and controls adapt
- **Modern UI**: Beautiful gradient design with smooth animations and visual effects

## How to Play

1. **Start the Game**:
   - Open `index.html` in your web browser
   - Enter your name in the input field
   - Click "Start Game" or press Enter

2. **Game Controls**:
   - Use **Arrow Keys** to control the snake
   - **Up Arrow**: Move up
   - **Down Arrow**: Move down
   - **Left Arrow**: Move left
   - **Right Arrow**: Move right
   - **Pause**: Click the Pause button in the left sidebar (toggles Resume)
   - **Quit**: Click the Quit button to stop the game and return to the start screen

3. **Game Rules**:
   - Guide the snake to eat the glowing red food
   - Each food eaten increases your score by 1
   - The snake grows longer with each food eaten
   - Avoid hitting the walls or the snake's own body
   - Game ends when you collide with walls or yourself

4. **Scoring System**:
   - Current score is displayed in real-time
   - High score is loaded from localStorage and displayed
   - New high scores are automatically saved
   - Session score is tracked during gameplay

## Visual Enhancements

### Snake Animations
- **Slither Effect**: Snake body segments move with realistic slithering motion
- **Glowing Head**: Snake head has a green glow effect with detailed eyes and tongue
- **Gradient Body**: Snake body uses gradient colors for depth
- **Texture Details**: Subtle texture effects on body segments

### Game Environment
- **Board-Sized Canvas**: Canvas is strictly constrained between the scoreboard and statusbar
- **Jungle Background**: Dark blue gradient with subtle grid pattern
- **Animated Food**: Glowing red food with pulsing animation
- **Grid Pattern**: Subtle grid lines for jungle atmosphere

### Game Over Experience
- **Dramatic Animation**: Animated "GAME OVER" text with pulsing effect
- **Snake Death Animation**: Animated snake body parts spinning and fading
- **Sound Effects**: Game over sound plays when you lose
- **Delayed Display**: Game over screen appears after a dramatic pause

## File Structure

```
snake-game/
├── index.html      # Main HTML structure (scoreboard, canvas, left sidebar, statusbar)
├── style.css       # CSS styling, layout (between bars), sidebar and animations
├── script.js       # JavaScript game logic, board sizing, controls (Pause/Quit)
└── README.md       # This file
```

## Technical Details

### Storage Implementation
- **sessionStorage**: Used to track the current game's score
- **localStorage**: Used to persist the highest score across browser sessions

### Game Mechanics
- **Board-Sized Canvas**: Dynamically resizes to fit between top and bottom bars
- **Crisp Grid Sizing**: Canvas width/height snap to multiples of the grid size for sharp lines
- **Grid-based movement**: 25x25 pixel grid for smooth gameplay
- **Collision detection**: Wall and self-collision detection
- **Random food generation**: Ensures food doesn't spawn on snake
- **Snake growth mechanics**: Body segments added when eating food
- **Smooth game loop**: 120ms intervals for responsive gameplay

### Animation System
- **Frame-based animations**: Uses animation frames for smooth effects
- **Sine wave motion**: Creates realistic slithering effect
- **Glow effects**: Canvas shadow effects for visual appeal
- **Gradient rendering**: Linear gradients for depth and realism

### Audio Features
- **Game Over Sound**: Embedded audio file for dramatic effect
- **Error handling**: Graceful fallback if audio fails to play

### Browser Compatibility
- Works on all modern browsers
- Responsive design for mobile devices
- No external dependencies required

## Getting Started

1. Download or clone the repository
2. Open `index.html` in your web browser
3. Enter your name and start playing!

## Future Enhancements

- Multiple difficulty levels with different speeds
- Power-ups and special food types
- Background music and sound effects
- Multiplayer support
- Leaderboard with multiple players
- Touch controls for mobile devices
- Particle effects for eating food
- Different snake skins and themes
