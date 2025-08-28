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
const EDGE_MARGIN_CELLS = 1; // prevent food near edges

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
const topBar = document.getElementById('topBar');
const statusBar = document.getElementById('statusBar');
const sideMenu = document.getElementById('sideMenu');
const btnPause = document.getElementById('btnPause');
const btnQuit = document.getElementById('btnQuit');
const btnUp = document.getElementById('btnUp');
const btnDown = document.getElementById('btnDown');
const btnLeft = document.getElementById('btnLeft');
const btnRight = document.getElementById('btnRight');

// Initialize the game
function init() {
	canvas = document.getElementById('gameCanvas');
	ctx = canvas.getContext('2d');
	
	// Set canvas size between bars
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
	
	// Mobile swipe controls (higher sensitivity)
	canvas.addEventListener('touchstart', handleTouchStart, { passive: true });
	canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
	canvas.addEventListener('touchend', handleTouchEnd, { passive: true });
	
	// On-screen buttons
	if (btnUp) btnUp.addEventListener('click', () => changeDirection('up'));
	if (btnDown) btnDown.addEventListener('click', () => changeDirection('down'));
	if (btnLeft) btnLeft.addEventListener('click', () => changeDirection('left'));
	if (btnRight) btnRight.addEventListener('click', () => changeDirection('right'));

	// Side menu buttons
	if (btnPause) btnPause.addEventListener('click', togglePauseGame);
	if (btnQuit) btnQuit.addEventListener('click', quitGame);
	
	// Focus on input when page loads
	playerNameInput.focus();
}

// Resize canvas to fit between bars
function resizeCanvas() {
	const top = topBar ? topBar.getBoundingClientRect().height : 0;
	const bottom = statusBar ? statusBar.getBoundingClientRect().height : 0;
	const availableHeight = Math.max(100, window.innerHeight - top - bottom);

	// Desired render width: centered and constrained like CSS width
	const isMobile = window.innerWidth <= 768;
	const cssMaxWidth = 1100; // keep in sync with CSS
	const sideMenuGutter = 12 + 180; // left offset + approx menu width
	const targetCssWidth = Math.min(window.innerWidth - sideMenuGutter, isMobile ? Math.floor(window.innerWidth * 0.96) : cssMaxWidth);

	// Snap canvas internal size to GRID_SIZE multiples for crisp grid
	const cols = Math.max(10, Math.floor(targetCssWidth / GRID_SIZE));
	const rows = Math.max(6, Math.floor(availableHeight / GRID_SIZE));
	const pixelWidth = cols * GRID_SIZE;
	const pixelHeight = rows * GRID_SIZE;

	canvas.width = pixelWidth;
	canvas.height = pixelHeight;
	canvas.style.top = `${top}px`;
	canvas.style.width = `${pixelWidth}px`;
	canvas.style.height = `${pixelHeight}px`;

	// Position side menu to fit between bars
	if (sideMenu) {
		// Slight offset so buttons sit just below the scoreboard shadow
		sideMenu.style.top = `${top + 8}px`;
		sideMenu.style.bottom = `${bottom}px`;
	}
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

	// Recalculate sizes now that bars are visible
	resizeCanvas();
	
	// Initialize game state
	initGame();
	
	// Start game loop
	gameRunning = true;
	const isMobileDevice = (window.innerWidth <= 768) || ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
	const effectiveSpeed = isMobileDevice ? GAME_SPEED * 3 : GAME_SPEED;
	gameLoop = setInterval(updateGame, effectiveSpeed);
	
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
	if (hintTimeoutId) clearTimeout(hintTimeoutId);
	hintTimeoutId = setTimeout(() => {
		instructionHint.classList.remove('fade-in');
		instructionHint.classList.add('fade-out');
		setTimeout(() => { instructionHint.style.display = 'none'; }, 350);
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
	const cols = Math.floor(canvas.width / GRID_SIZE);
	const rows = Math.floor(canvas.height / GRID_SIZE);
	const centerX = Math.floor(cols / 2);
	const centerY = Math.floor(rows / 2);
	
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

// Generate random food position (avoid edges)
function generateFood() {
	const maxX = Math.floor(canvas.width / GRID_SIZE);
	const maxY = Math.floor(canvas.height / GRID_SIZE);
	const minCellX = EDGE_MARGIN_CELLS;
	const minCellY = EDGE_MARGIN_CELLS;
	const maxCellX = Math.max(minCellX + 1, maxX - 1 - EDGE_MARGIN_CELLS);
	const maxCellY = Math.max(minCellY + 1, maxY - 1 - EDGE_MARGIN_CELLS);
	
	function randomCell(min, max) {
		// inclusive of min, inclusive of max
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}
	
	let pos = { x: randomCell(minCellX, maxCellX), y: randomCell(minCellY, maxCellY) };
	// Ensure food doesn't spawn on snake or outside safe bounds
	while (
		snake.some(segment => segment.x === pos.x && segment.y === pos.y)
	) {
		pos = { x: randomCell(minCellX, maxCellX), y: randomCell(minCellY, maxCellY) };
	}
	food = pos;
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

// Pause/Resume game
function togglePauseGame() {
    if (!gameContainer || !canvas) return;
    if (gameRunning) {
        gameRunning = false;
        if (btnPause) btnPause.textContent = 'Resume';
    } else {
        gameRunning = true;
        if (btnPause) btnPause.textContent = 'Pause';
        resumeWithEffectiveSpeed();
    }
}

// Quit game: stop loop and return to name modal
function quitGame() {
    gameRunning = false;
    if (gameLoop) clearInterval(gameLoop);
    // Reset UI state
    gameOverModal.style.display = 'none';
    gameContainer.style.display = 'none';
    nameModal.style.display = 'flex';
    // Reset input/button states
    if (btnPause) btnPause.textContent = 'Pause';
    playerNameInput.value = '';
    playerNameInput.focus();
}

// Move snake based on direction
function moveSnake() {
	const head = {x: snake[0].x, y: snake[0].y};
	
	switch (direction) {
		case 'up': head.y--; break;
		case 'down': head.y++; break;
		case 'left': head.x--; break;
		case 'right': head.x++; break;
	}
	
	snake.unshift(head);
}

function changeDirection(newDir) {
	if (!gameRunning) return;
	if (newDir === 'up' && direction !== 'down') direction = 'up';
	else if (newDir === 'down' && direction !== 'up') direction = 'down';
	else if (newDir === 'left' && direction !== 'right') direction = 'left';
	else if (newDir === 'right' && direction !== 'left') direction = 'right';
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
	
	// Self collision
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
			drawSnakeHead(x, y);
		} else {
			drawSnakeBody(x, y, index);
		}
	});
}

// Draw snake head
function drawSnakeHead(x, y) {
	ctx.shadowColor = '#4CAF50';
	ctx.shadowBlur = 10;
	ctx.fillStyle = '#2E7D32';
	ctx.fillRect(x + 2, y + 2, GRID_SIZE - 4, GRID_SIZE - 4);
	ctx.fillStyle = '#fff';
	ctx.fillRect(x + 6, y + 6, 3, 3);
	ctx.fillRect(x + 15, y + 6, 3, 3);
	ctx.fillStyle = '#000';
	ctx.fillRect(x + 7, y + 7, 1, 1);
	ctx.fillRect(x + 16, y + 7, 1, 1);
	ctx.fillStyle = '#ff0000';
	ctx.fillRect(x + 11, y + 20, 3, 5);
	ctx.shadowBlur = 0;
}

// Draw snake body
function drawSnakeBody(x, y, index) {
	const offset = Math.sin(animationFrame * 0.2 + index * 0.5) * 2;
	const gradient = ctx.createLinearGradient(x, y, x + GRID_SIZE, y + GRID_SIZE);
	gradient.addColorStop(0, '#4CAF50');
	gradient.addColorStop(1, '#388E3C');
	ctx.fillStyle = gradient;
	ctx.fillRect(x + 1, y + 1 + offset, GRID_SIZE - 2, GRID_SIZE - 2);
	ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
	ctx.fillRect(x + 3, y + 3 + offset, GRID_SIZE - 6, 2);
}

// Draw food with glow animation
function drawFood() {
	const x = food.x * GRID_SIZE;
	const y = food.y * GRID_SIZE;
	const glowIntensity = Math.sin(animationFrame * 0.3) * 0.3 + 0.7;
	ctx.shadowColor = '#FF5722';
	ctx.shadowBlur = 15 * glowIntensity;
	ctx.fillStyle = '#FF5722';
	ctx.beginPath();
	ctx.arc(x + GRID_SIZE/2, y + GRID_SIZE/2, GRID_SIZE/2 - 2, 0, Math.PI * 2);
	ctx.fill();
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
	playSadSound();
	const isNewHighScore = saveHighScore();
	setTimeout(() => {
		finalScoreElement.textContent = score;
		if (isNewHighScore) { newHighScoreElement.style.display = 'block'; newHighScoreElement.classList.add('celebrate'); }
		else { newHighScoreElement.style.display = 'none'; }
		gameOverModal.style.display = 'flex';
	}, 500);
}

function playSadSound() {
	const audio = sadSound || gameOverSound;
	if (!audio) return;
	try { audio.currentTime = 0; audio.play().catch(() => {}); } catch (_) {}
}

// Restart game
function restartGame() {
	gameOverModal.style.display = 'none';
	nameModal.style.display = 'flex';
	gameContainer.style.display = 'none';
	playerNameInput.value = '';
	playerNameInput.focus();
}

// Ensure speed adjusts when resuming from pause on mobile
function resumeWithEffectiveSpeed() {
    const isMobileDevice = (window.innerWidth <= 768) || ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    const effectiveSpeed = isMobileDevice ? GAME_SPEED * 3 : GAME_SPEED;
    clearInterval(gameLoop);
    gameLoop = setInterval(updateGame, effectiveSpeed);
}

// Keyboard controls
document.addEventListener('keydown', function(e) {
	if (!gameRunning) return;
	switch (e.key) {
		case 'ArrowUp': changeDirection('up'); break;
		case 'ArrowDown': changeDirection('down'); break;
		case 'ArrowLeft': changeDirection('left'); break;
		case 'ArrowRight': changeDirection('right'); break;
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
	// lower threshold to increase sensitivity
	if (Math.abs(dx) > 6 || Math.abs(dy) > 6) { e.preventDefault(); }
}

function handleTouchEnd(e) {
	if (!gameRunning) return;
	const dx = (e.changedTouches && e.changedTouches[0].clientX - touchStartX) || 0;
	const dy = (e.changedTouches && e.changedTouches[0].clientY - touchStartY) || 0;
	// lower swipe detection threshold
	if (Math.abs(dx) < 12 && Math.abs(dy) < 12) return; // ignore tiny taps
	if (Math.abs(dx) > Math.abs(dy)) {
		if (dx > 0) changeDirection('right'); else changeDirection('left');
	} else {
		if (dy > 0) changeDirection('down'); else changeDirection('up');
	}
}

// Initialize when page loads
window.addEventListener('load', init);
