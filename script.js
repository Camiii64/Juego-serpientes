const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const box = 20;
const cols = canvas.width / box;
const rows = canvas.height / box;

let snake;
let direction;
let food;
let score = 0;
let best = 0;
let gameInterval = null;
let gameSpeed = 300; // velocidad reducida

const scoreEl = document.getElementById('score');
const bestEl = document.getElementById('best');
const btnRestart = document.getElementById('btnRestart');
const speedRange = document.getElementById('speedRange');

// Cargar récord
function loadBest() {
  const stored = localStorage.getItem('snake_best');
  best = stored ? parseInt(stored, 10) : 0;
  bestEl.textContent = best;
}

// Guardar récord
function saveBest() {
  localStorage.setItem('snake_best', String(best));
}

// Inicializa
function init() {
  snake = [{ x: 9 * box, y: 10 * box }];
  direction = 'LEFT';
  score = 0;
  scoreEl.textContent = score;
  placeFood();
  gameSpeed = 260 - parseInt(speedRange.value, 10);
  document.getElementById("gameOverPanel").classList.add("hidden");
  restartLoop();
}

// Colocar comida
function placeFood() {
  function randomCell() {
    return {
      x: Math.floor(Math.random() * cols) * box,
      y: Math.floor(Math.random() * rows) * box
    };
  }
  let candidate = randomCell();
  while (snake.some(part => part.x === candidate.x && part.y === candidate.y)) {
    candidate = randomCell();
  }
  food = candidate;
}

// Dibujo principal
function draw() {
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // comida
  ctx.fillStyle = 'red';
  ctx.fillRect(food.x, food.y, box, box);

  // serpiente
  for (let i = 0; i < snake.length; i++) {
    ctx.fillStyle = (i === 0) ? '#2ecc71' : (i === snake.length - 1 ? '#f1c40f' : '#1abc9c');
    ctx.fillRect(snake[i].x, snake[i].y, box, box);
    ctx.strokeStyle = '#061';
    ctx.strokeRect(snake[i].x, snake[i].y, box, box);
  }

  // movimiento
  const head = { x: snake[0].x, y: snake[0].y };
  if (direction === 'LEFT') head.x -= box;
  if (direction === 'RIGHT') head.x += box;
  if (direction === 'UP') head.y -= box;
  if (direction === 'DOWN') head.y += box;

  // comer
  const ateFood = head.x === food.x && head.y === food.y;
  if (ateFood) {
    score++;
    scoreEl.textContent = score;
    if (score % 3 === 0 && gameSpeed > 40) {
      gameSpeed = Math.max(40, gameSpeed - 8);
      restartLoop();
    }
    placeFood();
  } else {
    snake.pop();
  }

  snake.unshift(head);

  // colisiones
  if (head.x < 0 || head.x >= canvas.width || head.y < 0 || head.y >= canvas.height) {
    endGame();
    return;
  }

  for (let i = 1; i < snake.length; i++) {
    if (head.x === snake[i].x && head.y === snake[i].y) {
      endGame();
      return;
    }
  }
}

// Dirección
function changeDirection(e) {
  const key = e.key;
  if ((key === 'ArrowLeft' || key === 'a' || key === 'A') && direction !== 'RIGHT') direction = 'LEFT';
  else if ((key === 'ArrowUp' || key === 'w' || key === 'W') && direction !== 'DOWN') direction = 'UP';
  else if ((key === 'ArrowRight' || key === 'd' || key === 'D') && direction !== 'LEFT') direction = 'RIGHT';
  else if ((key === 'ArrowDown' || key === 's' || key === 'S') && direction !== 'UP') direction = 'DOWN';
}

// Fin del juego
function endGame() {
  clearInterval(gameInterval);
  if (score > best) {
    best = score;
    saveBest();
    bestEl.textContent = best;
  }
  document.getElementById("finalScore").textContent = score;
  document.getElementById("finalBest").textContent = best;
  document.getElementById("gameOverPanel").classList.remove("hidden");
}

// Bucle
function restartLoop() {
  if (gameInterval) clearInterval(gameInterval);
  gameInterval = setInterval(draw, gameSpeed);
}

// Listeners
document.addEventListener('keydown', changeDirection);
btnRestart.addEventListener('click', () => init());
speedRange.addEventListener('input', (e) => {
  const val = parseInt(e.target.value, 10);
  gameSpeed = 260 - val;
  restartLoop();
});

// Iniciar
loadBest();
init();
