const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// =================
// ESTADOS
// =================
let fase = 1;
let gameRunning = false;
let paused = false;
let dificuldade = "medio";

// =================
// AUDIO 🔊
// =================
const music = new Audio("menu.mp3");
music.loop = true;
music.volume = 0.6;

const hitSound = new Audio("hit.mp3");
hitSound.volume = 0.1;

// =================
// CONFIG
// =================
const paddleWidth = 12;
const paddleHeight = 100;
const ballSize = 12;
let maxSpeed = 8;

// =================
// FASES 🌍
// =================
function aplicarFase() {
  const fundos = {
    1: "images/mercury.gif",
    2: "images/uranus.gif",
    3: "images/earth.gif",
    4: "images/mars.gif",
    5: "images/jupiter.gif",
    6: "images/saturno.gif",
    7: "images/neptune.gif"
  };

  document.body.style.backgroundImage = `url('${fundos[fase]}')`;

  // aumenta dificuldade por fase
  maxSpeed = 6 + fase;
}

function startFase(n) {
  fase = n;

  document.getElementById("menu").style.display = "none";

  playerScore = 0;
  aiScore = 0;

  resetBall();
  aplicarFase();

  gameRunning = true;

  music.play().catch(() => {});
}

// =================
// PLAYER / IA / BOLA
// =================
let playerY = canvas.height / 2 - paddleHeight / 2;
let aiY = canvas.height / 2 - paddleHeight / 2;

let ballX = canvas.width / 2;
let ballY = canvas.height / 2;
let ballSpeedX = 5;
let ballSpeedY = 3;

// =================
// SCORE
// =================
let playerScore = 0;
let aiScore = 0;

// =================
// INPUT
// =================
let up = false;
let down = false;

document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowUp") up = true;
  if (e.key === "ArrowDown") down = true;

  if (e.key === "Escape") {
    paused = !paused;

    const menu = document.getElementById("pauseMenu");

    if (paused) {
      menu.style.display = "flex";
    } else {
      menu.style.display = "none";
    }
  }
});

document.addEventListener("keyup", (e) => {
  if (e.key === "ArrowUp") up = false;
  if (e.key === "ArrowDown") down = false;
});

// =================
// UPDATE
// =================
function update() {
  if (!gameRunning || paused) return;

  // player
  if (up) playerY -= 7;
  if (down) playerY += 7;

  playerY = Math.max(0, Math.min(canvas.height - paddleHeight, playerY));

  // 🤖 IA
  let aiCenter = aiY + paddleHeight / 2;

  let aiSpeed, error;

  if (dificuldade === "facil") {
    aiSpeed = 3;
    error = 40;
  } else if (dificuldade === "medio") {
    aiSpeed = 5;
    error = 20;
  } else {
    aiSpeed = 7;
    error = 5;
  }

  let target = ballY + (Math.random() - 0.5) * error;

  if (aiCenter < target) aiY += aiSpeed;
  else aiY -= aiSpeed;

  aiY = Math.max(0, Math.min(canvas.height - paddleHeight, aiY));

  // bola
  ballX += ballSpeedX;
  ballY += ballSpeedY;

  // colisão parede
  if (ballY <= 0 || ballY >= canvas.height - ballSize) {
    ballSpeedY *= -1;
  }

  // colisão player
  if (
    ballX <= paddleWidth &&
    ballY > playerY &&
    ballY < playerY + paddleHeight
  ) {
    let impact =
      (ballY - (playerY + paddleHeight / 2)) / (paddleHeight / 2);

    ballSpeedY = impact * 6;
    ballSpeedX *= -1.05;

    hitSound.currentTime = 0;
    hitSound.play();
  }

  // colisão IA
  if (
    ballX >= canvas.width - paddleWidth - ballSize &&
    ballY > aiY &&
    ballY < aiY + paddleHeight
  ) {
    let impact =
      (ballY - (aiY + paddleHeight / 2)) / (paddleHeight / 2);

    ballSpeedY = impact * 6;
    ballSpeedX *= -1.05;

    hitSound.currentTime = 0;
    hitSound.play();
  }

  // limite de velocidade
  ballSpeedX = Math.max(-maxSpeed, Math.min(maxSpeed, ballSpeedX));

  // pontos
  if (ballX < 0) {
    aiScore++;
    checkWinner();
    resetBall();
  }

  if (ballX > canvas.width) {
    playerScore++;
    checkWinner();
    resetBall();
  }
}

// =================
// WIN SYSTEM
// =================
function checkWinner() {
  if (playerScore >= 5) {
    alert("Você venceu! 🏆");
    resetGame();
  }

  if (aiScore >= 5) {
    alert("Você perdeu 😢");
    resetGame();
  }
}

function resetGame() {
  playerScore = 0;
  aiScore = 0;
  resetBall();
}

// =================
// RESET BALL
// =================
function resetBall() {
  ballX = canvas.width / 2;
  ballY = canvas.height / 2;

  ballSpeedX = 5 * (Math.random() > 0.5 ? 1 : -1);
  ballSpeedY = 3 * (Math.random() > 0.5 ? 1 : -1);
}

// =================
// DRAW
// =================
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (!gameRunning) return;

  ctx.shadowBlur = 20;
  ctx.shadowColor = "#00ffcc";

  ctx.fillStyle = "#00ffcc";

  ctx.fillRect(0, playerY, paddleWidth, paddleHeight);
  ctx.fillRect(canvas.width - paddleWidth, aiY, paddleWidth, paddleHeight);

  ctx.fillStyle = "white";
  ctx.fillRect(ballX, ballY, ballSize, ballSize);

  ctx.shadowBlur = 0;

  ctx.fillStyle = "white";
  ctx.font = "50px Arial";
  ctx.fillText(playerScore, canvas.width / 4, 80);
  ctx.fillText(aiScore, (canvas.width / 4) * 3, 80);

  if (paused) {
    ctx.fillText("PAUSE", canvas.width / 2 - 80, canvas.height / 2);
  }
}

// =================
// LOOP
// =================
function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

gameLoop();