const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const scoreEl = document.getElementById("score");
const overlayEl = document.getElementById("overlay");

const WIDTH = canvas.width;
const HEIGHT = canvas.height;
const GROUND_Y = 540;

const BIRD_X = 100;
const BIRD_SIZE = 26;

const GRAVITY = 0.45;
const FLAP_STRENGTH = -8.5;

const PIPE_WIDTH = 70;
const PIPE_GAP = 160;
const PIPE_SPEED = 3.2;
const PIPE_INTERVAL_MS = 1600;

const colors = {
  skyTop: "#7cc7ff",
  skyBottom: "#cfefff",
  sun: "#ffe08a",
  cloud: "#f9fdff",
  pipeLight: "#3cb371",
  pipeDark: "#1f6b43",
  ground: "#c2b280",
  groundTop: "#7dbb6a",
  bird: "#ffd24d",
  wing: "#f5b945",
  text: "#1f1f1f",
};

const state = {
  birdY: HEIGHT / 2,
  velocity: 0,
  pipes: [],
  score: 0,
  running: false,
  gameOver: false,
  lastPipeAt: 0,
};

function resetGame() {
  state.birdY = HEIGHT / 2;
  state.velocity = 0;
  state.pipes = [];
  state.score = 0;
  state.running = false;
  state.gameOver = false;
  state.lastPipeAt = 0;
  scoreEl.textContent = "0";
  overlayEl.textContent = "Click or press Space to start";
  overlayEl.classList.remove("hidden");
}

function startGame() {
  if (state.running) {
    return;
  }
  if (state.gameOver) {
    resetGame();
  }
  state.running = true;
  overlayEl.classList.add("hidden");
}

function flap() {
  if (!state.running) {
    startGame();
  }
  if (state.gameOver) {
    return;
  }
  state.velocity = FLAP_STRENGTH;
}

function spawnPipe() {
  const minCenter = 160;
  const maxCenter = GROUND_Y - 160;
  const gapCenter = Math.floor(Math.random() * (maxCenter - minCenter + 1)) + minCenter;
  const gapTop = gapCenter - PIPE_GAP / 2;
  const gapBottom = gapCenter + PIPE_GAP / 2;

  state.pipes.push({
    x: WIDTH,
    gapTop,
    gapBottom,
    scored: false,
  });
}

function rectOverlap(a, b) {
  return !(a.x2 < b.x1 || a.x1 > b.x2 || a.y2 < b.y1 || a.y1 > b.y2);
}

function endGame() {
  state.gameOver = true;
  state.running = false;
  overlayEl.textContent = "Game Over! Click or press Space to restart";
  overlayEl.classList.remove("hidden");
}

function update(now) {
  if (!state.running || state.gameOver) {
    return;
  }

  state.velocity += GRAVITY;
  state.birdY += state.velocity;

  if (state.lastPipeAt === 0 || now - state.lastPipeAt >= PIPE_INTERVAL_MS) {
    spawnPipe();
    state.lastPipeAt = now;
  }

  for (const pipe of state.pipes) {
    pipe.x -= PIPE_SPEED;

    if (!pipe.scored && pipe.x + PIPE_WIDTH < BIRD_X - BIRD_SIZE / 2) {
      pipe.scored = true;
      state.score += 1;
      scoreEl.textContent = String(state.score);
    }
  }

  state.pipes = state.pipes.filter((pipe) => pipe.x + PIPE_WIDTH > 0);

  const birdRect = {
    x1: BIRD_X - BIRD_SIZE / 2,
    y1: state.birdY - BIRD_SIZE / 2,
    x2: BIRD_X + BIRD_SIZE / 2,
    y2: state.birdY + BIRD_SIZE / 2,
  };

  if (birdRect.y1 <= 0 || birdRect.y2 >= GROUND_Y) {
    endGame();
    return;
  }

  for (const pipe of state.pipes) {
    const topRect = { x1: pipe.x, y1: 0, x2: pipe.x + PIPE_WIDTH, y2: pipe.gapTop };
    const bottomRect = {
      x1: pipe.x,
      y1: pipe.gapBottom,
      x2: pipe.x + PIPE_WIDTH,
      y2: GROUND_Y,
    };

    if (rectOverlap(topRect, birdRect) || rectOverlap(bottomRect, birdRect)) {
      endGame();
      return;
    }
  }
}

function drawBackground() {
  const gradient = ctx.createLinearGradient(0, 0, 0, HEIGHT);
  gradient.addColorStop(0, colors.skyTop);
  gradient.addColorStop(1, colors.skyBottom);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  ctx.fillStyle = colors.sun;
  ctx.beginPath();
  ctx.arc(70, 80, 40, 0, Math.PI * 2);
  ctx.fill();

  drawCloud(230, 90, 1);
  drawCloud(300, 160, 0.8);
  drawCloud(80, 160, 0.9);
}

function drawCloud(x, y, scale) {
  const w = 70 * scale;
  const h = 28 * scale;

  ctx.fillStyle = colors.cloud;

  ctx.beginPath();
  ctx.ellipse(x + w / 2, y + h / 2, w / 2, h / 2, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.ellipse(x + (2 * w) / 3, y, w / 3, h / 2, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.ellipse(x + w, y + h / 2, w / 2, h / 2, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawGround() {
  ctx.fillStyle = colors.ground;
  ctx.fillRect(0, GROUND_Y, WIDTH, HEIGHT - GROUND_Y);

  ctx.fillStyle = colors.groundTop;
  ctx.fillRect(0, GROUND_Y - 10, WIDTH, 10);
}

function drawPipes() {
  for (const pipe of state.pipes) {
    ctx.fillStyle = colors.pipeLight;
    ctx.strokeStyle = colors.pipeDark;
    ctx.lineWidth = 2;

    ctx.fillRect(pipe.x, 0, PIPE_WIDTH, pipe.gapTop);
    ctx.strokeRect(pipe.x, 0, PIPE_WIDTH, pipe.gapTop);

    ctx.fillRect(pipe.x - 4, pipe.gapTop - 14, PIPE_WIDTH + 8, 14);

    ctx.fillRect(pipe.x, pipe.gapBottom, PIPE_WIDTH, GROUND_Y - pipe.gapBottom);
    ctx.strokeRect(pipe.x, pipe.gapBottom, PIPE_WIDTH, GROUND_Y - pipe.gapBottom);

    ctx.fillRect(pipe.x - 4, pipe.gapBottom, PIPE_WIDTH + 8, 14);
  }
}

function drawBird() {
  const left = BIRD_X - BIRD_SIZE / 2;
  const top = state.birdY - BIRD_SIZE / 2;

  ctx.fillStyle = colors.bird;
  ctx.beginPath();
  ctx.ellipse(BIRD_X, state.birdY, BIRD_SIZE / 2, BIRD_SIZE / 2, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = colors.wing;
  ctx.beginPath();
  ctx.ellipse(BIRD_X - 2, state.birdY + 5, BIRD_SIZE / 3, BIRD_SIZE / 5, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = colors.text;
  ctx.beginPath();
  ctx.arc(left + BIRD_SIZE - 8, top + 8, 2.5, 0, Math.PI * 2);
  ctx.fill();
}

function render() {
  drawBackground();
  drawPipes();
  drawGround();
  drawBird();
}

function loop(now) {
  update(now);
  render();
  requestAnimationFrame(loop);
}

window.addEventListener("keydown", (event) => {
  if (event.code === "Space") {
    event.preventDefault();
    flap();
  }
});

canvas.addEventListener("mousedown", flap);
canvas.addEventListener("touchstart", (event) => {
  event.preventDefault();
  flap();
}, { passive: false });

resetGame();
requestAnimationFrame(loop);
