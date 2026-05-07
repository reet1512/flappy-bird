// script.js

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const bg = new Image();
bg.src = "assets/bg.png";

const birdImg = new Image();
birdImg.src = "assets/bird.png";

const pipeImg = new Image();
pipeImg.src = "assets/pipe.png";

const groundImg = new Image();
groundImg.src = "assets/ground.png";

// IMAGE ONLOAD HANDLERS
bg.onload = () => console.log("BG loaded");
birdImg.onload = () => console.log("Bird loaded");
pipeImg.onload = () => console.log("Pipe loaded");
groundImg.onload = () => console.log("Ground loaded");

// SOUNDS
const flapSound = new Audio("assets/flap.wav");
const scoreSound = new Audio("assets/score.wav");
const hitSound = new Audio("assets/hit.wav");

const scoreDisplay = document.getElementById("score");
const gameOverScreen = document.getElementById("gameOverScreen");
const finalScore = document.getElementById("finalScore");
const restartBtn = document.getElementById("restartBtn");
const startScreen = document.getElementById("startScreen");
const startBtn = document.getElementById("startBtn");

let gameStarted = false;

let bgX = 0;
let groundX = 0;
let difficultylevel = 1;


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

  const angle = bird.velocity * 0.05;

  ctx.save();

  ctx.translate(
    bird.x + bird.width / 2,
    bird.y + bird.height / 2
  );

  ctx.rotate(angle);

  ctx.drawImage(
    birdImg,
    -bird.width / 2,
    -bird.height / 2,
    bird.width,
    bird.height
  );

  ctx.restore();
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
function drawBird() {

  const angle = bird.velocity * 0.05;

  ctx.save();

  ctx.translate(
    bird.x + bird.width / 2,
    bird.y + bird.height / 2
  );

  ctx.rotate(angle);

  ctx.drawImage(
    birdImg,
    -bird.width / 2,
    -bird.height / 2,
    bird.width,
    bird.height
  );

  ctx.restore();
}

function drawBackground() {
  bgX -= 0.5;

  if (bgX <= -canvas.width) {
    bgX = 0;
  }

  ctx.drawImage(bg, bgX, 0, canvas.width, canvas.height);
  ctx.drawImage(bg, bgX + canvas.width, 0, canvas.width, canvas.height);
}

function drawGround() {
  groundX -= pipeSpeed;

  if (groundX <= -canvas.width) {
    groundX = 0;
  }

  ctx.drawImage(
    groundImg,
    groundX,
    canvas.height - 100,
    canvas.width,
    100
  );

  ctx.drawImage(
    groundImg,
    groundX + canvas.width,
    canvas.height - 100,
    canvas.width,
    100
  );
}

// UPDATE PIPES
function updatePipes() {
  pipes.forEach(pipe => {
    pipe.x -= pipeSpeed;

    // Score increase
   if (!pipe.counted && pipe.x + pipeWidth < bird.x) {

  score += 1;

  scoreSound.currentTime = 0;
  scoreSound.play();

  pipe.counted = true;

  scoreDisplay.textContent = score;

  // DIFFICULTY SCALING
  if (score % 5 === 0) {
    bird.gravity += 0.02;
  }
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

  flapSound.currentTime = 0;
  flapSound.play();
}
// GAME LOOP
function gameLoop() {
  
  if (!gameRunning || !gameStarted) {
  requestAnimationFrame(gameLoop);
  return;
}

  ctx.clearRect(0, 0, canvas.width, canvas.height);

// BACKGROUND
drawBackground();

// PIPES
updatePipes();
drawPipes();

// BIRD
updateBird();
drawBird();

// GROUND
drawGround();
  }

  updatePipes();
  drawPipes();

  frame++;

  requestAnimationFrame(gameLoop);


// START GAME
gameLoop();