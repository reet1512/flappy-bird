// script.js

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const scoreDisplay = document.getElementById("score");
const gameOverScreen = document.getElementById("gameOverScreen");
const finalScore = document.getElementById("finalScore");
const restartBtn = document.getElementById("restartBtn");
const startScreen = document.getElementById("startScreen");
const startBtn = document.getElementById("startBtn");

let gameStarted = false;
startBtn.addEventListener("click", () => {
  startScreen.classList.add("hidden");
  gameStarted = true;
});

// RESPONSIVE CANVAS
function resizeCanvas() {
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;
}

resizeCanvas();
window.addEventListener("resize", resizeCanvas);

// BIRD
const bird = {
  x: 80,
  y: 200,
  width: 35,
  height: 35,
  velocity: 0,
  gravity: 0.5,
  jump: -8
};

// PIPES
const pipes = [];
const pipeWidth = 60;
const pipeGap = 160;
const pipeSpeed = 7;

// GAME VARIABLES
let score = 0;
let gameRunning = true;
let frame = 0;

// CREATE PIPE
function createPipe() {
  const topHeight = Math.random() * (canvas.height - pipeGap - 200) + 50;

  pipes.push({
    x: canvas.width,
    topHeight: topHeight,
    bottomY: topHeight + pipeGap,
    counted: false
  });
}

// DRAW BIRD
function drawBird() {
  ctx.fillStyle = "yellow";
  ctx.beginPath();
  ctx.arc(
    bird.x + bird.width / 2,
    bird.y + bird.height / 2,
    bird.width / 2,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // Eye
  ctx.fillStyle = "black";
  ctx.beginPath();
  ctx.arc(bird.x + 22, bird.y + 12, 3, 0, Math.PI * 2);
  ctx.fill();
}

// UPDATE BIRD
function updateBird() {
  bird.velocity += bird.gravity;
  bird.y += bird.velocity;

  // Floor collision
  if (bird.y + bird.height >= canvas.height) {
    gameOver();
  }

  // Ceiling collision
  if (bird.y <= 0) {
    bird.y = 0;
    bird.velocity = 0;
  }
}

// DRAW PIPES
function drawPipes() {
  ctx.fillStyle = "green";

  pipes.forEach(pipe => {
    // Top pipe
    ctx.fillRect(pipe.x, 0, pipeWidth, pipe.topHeight);

    // Bottom pipe
    ctx.fillRect(
      pipe.x,
      pipe.bottomY,
      pipeWidth,
      canvas.height - pipe.bottomY
    );
  });
}

// UPDATE PIPES
function updatePipes() {
  pipes.forEach(pipe => {
    pipe.x -= pipeSpeed;

    // Score increase
    if (!pipe.counted && pipe.x + pipeWidth < bird.x) {
      score++;
      pipe.counted = true;
      scoreDisplay.textContent = score;
    }

    // Collision detection
    if (
      bird.x < pipe.x + pipeWidth &&
      bird.x + bird.width > pipe.x &&
      (
        bird.y < pipe.topHeight ||
        bird.y + bird.height > pipe.bottomY
      )
    ) {
      gameOver();
    }
  });

  // Remove old pipes
  while (pipes.length > 0 && pipes[0].x + pipeWidth < 0) {
    pipes.shift();
  }
}

// GAME OVER
function gameOver() {
  gameRunning = false;
  finalScore.textContent = `Score: ${score}`;
  gameOverScreen.classList.remove("hidden");
}

// RESTART GAME
function restartGame() {
  bird.y = 200;
  bird.velocity = 0;

  pipes.length = 0;

  score = 0;
  frame = 0;

  scoreDisplay.textContent = score;

  gameRunning = true;

  gameOverScreen.classList.add("hidden");

  
}

// CONTROLS
function flap() {
  if (!gameRunning) return;
  bird.velocity = bird.jump;
}

document.addEventListener("keydown", e => {
  if (e.code === "Space") {
    flap();
  }
});

document.addEventListener("click", flap);
document.addEventListener("touchstart", flap);

restartBtn.addEventListener("click", restartGame);

// GAME LOOP
function gameLoop() {
  
  if (!gameRunning || !gameStarted) {
  requestAnimationFrame(gameLoop);
  return;
}

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  updateBird();
  drawBird();

  // Create pipes every 100 frames
  if (frame % 100 === 0) {
    createPipe();
  }

  updatePipes();
  drawPipes();

  frame++;

  requestAnimationFrame(gameLoop);
}

// START GAME
gameLoop();