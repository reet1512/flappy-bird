// script.js

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const bg = new Image();
const birdImg = new Image();
const pipeImg = new Image();
const groundImg = new Image();

bg.src = "assets/flappy-bird-assets-master/sprites/bg.png";
birdImg.src = "assets/flappy-bird-assets-master/sprites/bird.png";
pipeImg.src = "assets/flappy-bird-assets-master/sprites/pipe.png";
groundImg.src = "assets/flappy-bird-assets-master/sprites/ground.png";

// PROFESSIONAL IMAGE PRELOADER
const images = [bg, birdImg, pipeImg, groundImg];

let imagesLoaded = 0;

images.forEach(img => {

  img.onload = () => {
    console.log(`${img.src} loaded`);

    imagesLoaded++;

    if (imagesLoaded === images.length) {
      console.log("All assets loaded");

      startGame();
    }
  };

  img.onerror = () => {
    console.error(`Failed to load: ${img.src}`);
  };

});

// SOUNDS
const flapSound = new Audio("assets/flappy-bird-assets-master/audio/wing.wav");
const scoreSound = new Audio("assets/flappy-bird-assets-master/audio/point.wav");
const hitSound = new Audio("assets/flappy-bird-assets-master/audio/hit.wav");

const scoreDisplay = document.getElementById("score");
const gameOverScreen = document.getElementById("gameOverScreen");
const finalScore = document.getElementById("finalScore");
const restartBtn = document.getElementById("restartBtn");
const startScreen = document.getElementById("startScreen");
const startBtn = document.getElementById("startBtn");
const playerName = document.getElementById("playerName");
const playerNameGameOver = document.getElementById("playerNameGameOver");
const userDisplay = document.getElementById("userDisplay");
const highScoreDisplay = document.getElementById("highScore");
const highScoreGameOverDisplay = document.getElementById("highScoreValue");
const pastScoresDisplay = document.getElementById("pastScoresList");

// USERNAME SYSTEM
let username = localStorage.getItem("username");

if (!username) {
  username = prompt("Enter your name:");
  if (username) {
    localStorage.setItem("username", username);
  } else {
    username = "Player";
    localStorage.setItem("username", username);
  }
}

// SCORE SYSTEM
function getHighScore() {
  return parseInt(localStorage.getItem("highScore")) || 0;
}

function getPastScores() {
  const scores = localStorage.getItem("pastScores");
  return scores ? JSON.parse(scores) : [];
}

function saveScore(newScore) {
  const currentHighScore = getHighScore();
  const pastScores = getPastScores();

  // Update high score if needed
  if (newScore > currentHighScore) {
    localStorage.setItem("highScore", newScore);
  }

  // Add to past scores (keep last 10)
  pastScores.unshift(newScore);
  if (pastScores.length > 10) {
    pastScores.pop();
  }
  localStorage.setItem("pastScores", JSON.stringify(pastScores));
}

function displayHighScore() {
  const highScore = getHighScore();
  highScoreDisplay.textContent = highScore;
  highScoreGameOverDisplay.textContent = highScore;
}

function displayPastScores() {
  const pastScores = getPastScores();
  pastScoresDisplay.innerHTML = "";
  
  if (pastScores.length === 0) {
    pastScoresDisplay.innerHTML = "<li>No past scores yet</li>";
    return;
  }

  pastScores.forEach((score, index) => {
    const li = document.createElement("li");
    li.textContent = `${index + 1}. Score: ${score}`;
    pastScoresDisplay.appendChild(li);
  });
}

// Display username on start screen
playerName.textContent = `Welcome, ${username}!`;
playerNameGameOver.textContent = `Player: ${username}`;
userDisplay.textContent = `${username}`;
userDisplay.style.display = "none"; // Hide until game starts

// Display high score on start screen
displayHighScore();
displayPastScores();

let gameStarted = false;

let bgX = 0;
let groundX = 0;
let difficultylevel = 1;
let selectedBirdGravity = 0.5; // Default gravity

// BIRD SPEED SELECTION
const speedButtons = document.querySelectorAll(".speed-btn");
speedButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    // Remove active class from all buttons
    speedButtons.forEach(b => b.classList.remove("active"));
    // Add active class to clicked button
    btn.classList.add("active");
    // Set the selected gravity
    selectedBirdGravity = parseFloat(btn.dataset.speed);
    console.log(`Bird speed selected: ${btn.dataset.label} (gravity: ${selectedBirdGravity})`);
  });
});


startBtn.addEventListener("click", () => {
  startScreen.classList.add("hidden");
  userDisplay.style.display = "block";
  gameStarted = true;
});

// RESPONSIVE CANVAS
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

resizeCanvas();
window.addEventListener("resize", resizeCanvas);
const pipes = [];


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
  bird.velocity += selectedBirdGravity;
  bird.y += bird.velocity;

  // Floor collision
  if (bird.y + bird.height >= canvas.height-100) {
    gameOver();
  }

  // Ceiling collision
  if (bird.y <= 0) {
    bird.y = 0;
    bird.velocity = 0;
  }
}

// DRAW PIPES
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
    selectedBirdGravity += 0.02;
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

function drawPipes() {
  pipes.forEach(pipe => {

    // TOP PIPE
    if (pipeImg.complete && pipeImg.naturalHeight !== 0) {
      ctx.drawImage(
        pipeImg,
        pipe.x,
        0,
        pipeWidth,
        pipe.topHeight
      );
    } else {
      // Fallback: draw green rectangle
      ctx.fillStyle = "#2ecc71";
      ctx.fillRect(pipe.x, 0, pipeWidth, pipe.topHeight);
    }

    // BOTTOM PIPE
    if (pipeImg.complete && pipeImg.naturalHeight !== 0) {
      ctx.drawImage(
        pipeImg,
        pipe.x,
        pipe.bottomY,
        pipeWidth,
        canvas.height - pipe.bottomY
      );
    } else {
      // Fallback: draw green rectangle
      ctx.fillStyle = "#2ecc71";
      ctx.fillRect(pipe.x, pipe.bottomY, pipeWidth, canvas.height - pipe.bottomY);
    }

  });
}

// GAME OVER
function gameOver() {
  gameRunning = false;
  finalScore.textContent = `Score: ${score}`;
  playerNameGameOver.textContent = `Player: ${username}`;
  userDisplay.style.display = "none"; // Hide username during game over
  
  // Save score and display scores
  saveScore(score);
  displayHighScore();
  displayPastScores();
  
  gameOverScreen.classList.remove("hidden");
}

// RESTART GAME
function restartGame() {
  bird.y = 200;
  bird.velocity = 0;

  pipes.length = 0;

  score = 0;
  frame = 0;
  
  // Reset selectedBirdGravity to the currently selected button value
  const activeBtn = document.querySelector(".speed-btn.active");
  if (activeBtn) {
    selectedBirdGravity = parseFloat(activeBtn.dataset.speed);
  }

  scoreDisplay.textContent = score;

  gameRunning = true;

  gameOverScreen.classList.add("hidden");
  userDisplay.style.display = "block";
  
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

  // PIPES (Create pipes every 100 frames)
  if (frame % 100 === 0) {
    createPipe();
  }
  updatePipes();
  drawPipes();

  // BIRD
  updateBird();
  drawBird();

  // GROUND
  drawGround();

  frame++;

  requestAnimationFrame(gameLoop);
}

// EVENT LISTENERS
document.addEventListener("keydown", e => {
  if (e.code === "Space") {
    flap();
  }
});

document.addEventListener("click", flap);
document.addEventListener("touchstart", flap);

restartBtn.addEventListener("click", restartGame);

// START GAME
function startGame() {
  console.log("All assets loaded");
  gameLoop();
}