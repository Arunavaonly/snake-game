// Game variables
let canvas, ctx;
let snake = [];
let food = {};
let direction = 'right';
let gameRunning = false;
let gameLoop;
let score = 0;
let playerName = '';
let highScore = 0;
let animationFrame = 0;
let snakeAnimationOffset = 0;
let hintTimeoutId = null;
let touchStartX = 0;
let touchStartY = 0;

// Game constants
const GRID_SIZE = 25; // Increased grid size for better visibility
const GAME_SPEED = 160; // Slightly faster for better gameplay

// DOM elements
const nameModal = document.getElementById('nameModal');
const gameContainer = document.getElementById('gameContainer');
const playerNameInput = document.getElementById('playerName');
const startGameBtn = document.getElementById('startGame');
const displayPlayerName = document.getElementById('displayPlayerName');
const currentScoreElement = document.getElementById('currentScore');
const highScoreElement = document.getElementById('highScore');
const gameOverModal = document.getElementById('gameOverModal');
const finalScoreElement = document.getElementById('finalScore');
const newHighScoreElement = document.getElementById('newHighScore');
const playAgainBtn = document.getElementById('playAgain');
const gameOverSound = document.getElementById('gameOverSound');
const sadSound = document.getElementById('sadSound');
const instructionHint = document.getElementById('instructionHint');

// Initialize the game
function init() {
	canvas = document.getElementById('gameCanvas');
	ctx = canvas.getContext('2d');
	
	// Set canvas to full screen
	resizeCanvas();
	window.addEventListener('resize', resizeCanvas);
	
	// Load high score from localStorage
	loadHighScore();
	
	// Event listeners
	startGameBtn.addEventListener('click', startGame);
	playAgainBtn.addEventListener('click', restartGame);
	playerNameInput.addEventListener('keypress', function(e) {
		if (e.key === 'Enter') {
			startGame();
		}
	});
	
	// Mobile swipe controls
	canvas.addEventListener('touchstart', handleTouchStart, { passive: true });
	canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
	canvas.addEventListener('touchend', handleTouchEnd, { passive: true });
	
	// Focus on input when page loads
	playerNameInput.focus();
}

// Resize canvas to full screen
function resizeCanvas() {
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
}

// Load high score from localStorage
function loadHighScore() {
	const savedHighScore = localStorage.getItem('snakeGameHighScore');
	if (savedHighScore) {
		highScore = parseInt(savedHighScore);
		highScoreElement.textContent = highScore;
	}
}

// Save high score to localStorage
function saveHighScore() {
	if (score > highScore) {
		highScore = score;
		localStorage.setItem('snakeGameHighScore', highScore);
		highScoreElement.textContent = highScore;
		return true; // New high score achieved
	}
	return false;
}

// Start the game
function startGame() {
	const name = playerNameInput.value.trim();
	if (name === '') {
		alert('Please enter your name!');
		return;
	}
	
	playerName = name;
	displayPlayerName.textContent = `Player: ${playerName}`;
	
	// Hide name modal and show game
	nameModal.style.display = 'none';
	gameContainer.style.display = 'block';
	
	// Initialize game state
	initGame();
	
	// Start game loop
	gameRunning = true;
	gameLoop = setInterval(updateGame, GAME_SPEED);
	
	// Show transient instruction hint
	showInstructionHint();
	
	// Focus on canvas for keyboard events
	canvas.focus();
}

function showInstructionHint() {
	if (!instructionHint) return;
	instructionHint.style.display = 'block';
	instructionHint.classList.remove('fade-out');
	instructionHint.classList.add('fade-in');
	
	// Hide after 2.5s
	if (hintTimeoutId) clearTimeout(hintTimeoutId);
	hintTimeoutId = setTimeout(() => {
		instructionHint.classList.remove('fade-in');
		instructionHint.classList.add('fade-out');
		setTimeout(() => {
			instructionHint.style.display = 'none';
		}, 350);
	}, 2500);
}

// Initialize game state
function initGame() {
	// Reset score
	score = 0;
	currentScoreElement.textContent = score;
	
	// Clear sessionStorage for new game
	sessionStorage.removeItem('snakeGameScore');
	
	// Initialize snake in center of screen
	const centerX = Math.floor(canvas.width / (2 * GRID_SIZE));
	const centerY = Math.floor(canvas.height / (2 * GRID_SIZE));
	
	snake = [
		{x: centerX, y: centerY},
		{x: centerX - 1, y: centerY},
		{x: centerX - 2, y: centerY}
	];
	
	// Set initial direction
	direction = 'right';
	
	// Generate food
	generateFood();
	
	// Draw initial state
	drawGame();
}

// Generate random food position
function generateFood() {
	const maxX = Math.floor(canvas.width / GRID_SIZE);
	const maxY = Math.floor(canvas.height / GRID_SIZE);
	
	food = {
		x: Math.floor(Math.random() * maxX),
		y: Math.floor(Math.random() * maxY)
	};
	
	// Make sure food doesn't spawn on snake
	while (snake.some(segment => segment.x === food.x && segment.y === food.y)) {
		food = {
			x: Math.floor(Math.random() * maxX),
			y: Math.floor(Math.random() * maxY)
		};
	}
}

// Update game state
function updateGame() {
	if (!gameRunning) return;
	
	// Move snake
	moveSnake();
	
	// Check collisions
	if (checkCollision()) {
		gameOver();
		return;
	}
	
	// Check if snake ate food
	if (snake[0].x === food.x && snake[0].y === food.y) {
		// Increase score
		score++;
		currentScoreElement.textContent = score;
		
		// Save current score to sessionStorage
		sessionStorage.setItem('snakeGameScore', score);
		
		// Generate new food
		generateFood();
		
		// Don't remove tail (snake grows)
	} else {
		// Remove tail
		snake.pop();
	}
	
	// Draw updated game
	drawGame();
	
	// Update animation frame
	animationFrame++;
	snakeAnimationOffset = Math.sin(animationFrame * 0.2) * 2;
}

// Move snake based on direction
function moveSnake() {
	const head = {x: snake[0].x, y: snake[0].y};
	
	switch (direction) {
		case 'up':
			head.y--;
			break;
		case 'down':
			head.y++;
			break;
		case 'left':
			head.x--;
			break;
		case 'right':
			head.x++;
			break;
	}
	
	snake.unshift(head);
}

// Check for collisions
function checkCollision() {
	const head = snake[0];
	const maxX = Math.floor(canvas.width / GRID_SIZE);
	const maxY = Math.floor(canvas.height / GRID_SIZE);
	
	// Wall collision
	if (head.x < 0 || head.x >= maxX || head.y < 0 || head.y >= maxY) {
		return true;
	}
	
	// Self collision (check if head collides with any body segment)
	for (let i = 1; i < snake.length; i++) {
		if (head.x === snake[i].x && head.y === snake[i].y) {
			return true;
		}
	}
	
	return false;
}

// Draw the game with animations
function drawGame() {
	// Clear canvas
	ctx.fillStyle = 'rgba(30, 60, 114, 0.1)';
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	
	// Draw grid pattern for jungle effect
	drawGrid();
	
	// Draw snake with animations
	drawSnake();
	
	// Draw food with glow animation
	drawFood();
}

// Draw grid pattern
function drawGrid() {
	ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
	ctx.lineWidth = 1;
	
	for (let x = 0; x < canvas.width; x += GRID_SIZE) {
		ctx.beginPath();
		ctx.moveTo(x, 0);
		ctx.lineTo(x, canvas.height);
		ctx.stroke();
	}
	
	for (let y = 0; y < canvas.height; y += GRID_SIZE) {
		ctx.beginPath();
		ctx.moveTo(0, y);
		ctx.lineTo(canvas.width, y);
		ctx.stroke();
	}
}

// Draw snake with animations
function drawSnake() {
	snake.forEach((segment, index) => {
		const x = segment.x * GRID_SIZE;
		const y = segment.y * GRID_SIZE;
		
		if (index === 0) {
			// Draw head with special effects
			drawSnakeHead(x, y);
		} else {
			// Draw body with slither animation
			drawSnakeBody(x, y, index);
		}
	});
}

// Draw snake head
function drawSnakeHead(x, y) {
	// Head glow effect
	ctx.shadowColor = '#4CAF50';
	ctx.shadowBlur = 10;
	
	// Main head
	ctx.fillStyle = '#2E7D32';
	ctx.fillRect(x + 2, y + 2, GRID_SIZE - 4, GRID_SIZE - 4);
	
	// Eyes
	ctx.fillStyle = '#fff';
	ctx.fillRect(x + 6, y + 6, 3, 3);
	ctx.fillRect(x + 15, y + 6, 3, 3);
	
	// Pupils
	ctx.fillStyle = '#000';
	ctx.fillRect(x + 7, y + 7, 1, 1);
	ctx.fillRect(x + 16, y + 7, 1, 1);
	
	// Tongue
	ctx.fillStyle = '#ff0000';
	ctx.fillRect(x + 11, y + 20, 3, 5);
	
	ctx.shadowBlur = 0;
}

// Draw snake body
function drawSnakeBody(x, y, index) {
	// Slither animation offset
	const offset = Math.sin(animationFrame * 0.2 + index * 0.5) * 2;
	
	// Body segment with gradient
	const gradient = ctx.createLinearGradient(x, y, x + GRID_SIZE, y + GRID_SIZE);
	gradient.addColorStop(0, '#4CAF50');
	gradient.addColorStop(1, '#388E3C');
	
	ctx.fillStyle = gradient;
	ctx.fillRect(x + 1, y + 1 + offset, GRID_SIZE - 2, GRID_SIZE - 2);
	
	// Add some texture
	ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
	ctx.fillRect(x + 3, y + 3 + offset, GRID_SIZE - 6, 2);
}

// Draw food with glow animation
function drawFood() {
	const x = food.x * GRID_SIZE;
	const y = food.y * GRID_SIZE;
	
	// Glow effect
	const glowIntensity = Math.sin(animationFrame * 0.3) * 0.3 + 0.7;
	ctx.shadowColor = '#FF5722';
	ctx.shadowBlur = 15 * glowIntensity;
	
	// Main food
	ctx.fillStyle = '#FF5722';
	ctx.beginPath();
	ctx.arc(x + GRID_SIZE/2, y + GRID_SIZE/2, GRID_SIZE/2 - 2, 0, Math.PI * 2);
	ctx.fill();
	
	// Inner glow
	ctx.fillStyle = '#FF9800';
	ctx.beginPath();
	ctx.arc(x + GRID_SIZE/2, y + GRID_SIZE/2, GRID_SIZE/3, 0, Math.PI * 2);
	ctx.fill();
	
	ctx.shadowBlur = 0;
}

// Game over with sound and animation
function gameOver() {
	gameRunning = false;
	clearInterval(gameLoop);
	
	// Play sad game over sound (prefer sadSound; fallback to gameOverSound)
	playSadSound();
	
	// Save score to localStorage
	const isNewHighScore = saveHighScore();
	
	// Show game over modal with delay for dramatic effect
	setTimeout(() => {
		finalScoreElement.textContent = score;
		
		if (isNewHighScore) {
			newHighScoreElement.style.display = 'block';
			newHighScoreElement.classList.add('celebrate');
		} else {
			newHighScoreElement.style.display = 'none';
		}
		
		gameOverModal.style.display = 'flex';
	}, 500);
}

function playSadSound() {
	const audio = sadSound || gameOverSound;
	if (!audio) return;
	try {
		audio.currentTime = 0;
		audio.play().catch(() => {});
	} catch (_) {}
}

// Restart game
function restartGame() {
	// Hide game over modal
	gameOverModal.style.display = 'none';
	
	// Show name modal again
	nameModal.style.display = 'flex';
	gameContainer.style.display = 'none';
	
	// Clear input
	playerNameInput.value = '';
	playerNameInput.focus();
}

// Keyboard controls
document.addEventListener('keydown', function(e) {
	if (!gameRunning) return;
	
	switch (e.key) {
		case 'ArrowUp':
			if (direction !== 'down') {
				direction = 'up';
			}
			break;
		case 'ArrowDown':
			if (direction !== 'up') {
				direction = 'down';
			}
			break;
		case 'ArrowLeft':
			if (direction !== 'right') {
				direction = 'left';
			}
			break;
		case 'ArrowRight':
			if (direction !== 'left') {
				direction = 'right';
			}
			break;
	}
});

// Touch controls handlers
function handleTouchStart(e) {
	if (!gameRunning) return;
	if (!e.touches || e.touches.length === 0) return;
	touchStartX = e.touches[0].clientX;
	touchStartY = e.touches[0].clientY;
}

function handleTouchMove(e) {
	if (!gameRunning) return;
	if (!e.touches || e.touches.length === 0) return;
	
	const dx = e.touches[0].clientX - touchStartX;
	const dy = e.touches[0].clientY - touchStartY;
	
	// Prevent page scroll when swiping to control snake
	if (Math.abs(dx) > 10 || Math.abs(dy) > 10) {
		e.preventDefault();
	}
}

function handleTouchEnd(e) {
	if (!gameRunning) return;
	const dx = (e.changedTouches && e.changedTouches[0].clientX - touchStartX) || 0;
	const dy = (e.changedTouches && e.changedTouches[0].clientY - touchStartY) || 0;
	
	if (Math.abs(dx) < 20 && Math.abs(dy) < 20) return; // ignore taps
	
	if (Math.abs(dx) > Math.abs(dy)) {
		// horizontal swipe
		if (dx > 0 && direction !== 'left') direction = 'right';
		else if (dx < 0 && direction !== 'right') direction = 'left';
	} else {
		// vertical swipe
		if (dy > 0 && direction !== 'up') direction = 'down';
		else if (dy < 0 && direction !== 'down') direction = 'up';
	}
}

// Initialize when page loads
window.addEventListener('load', init);
