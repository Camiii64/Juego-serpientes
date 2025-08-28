const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const box = 20; // Tamaño de bloque
const cols = canvas.width / box;
const rows = canvas.height / box;

let snake;
let direction;
let food;
let score = 0;
let best = 0;
let gameInterval = null;
let gameSpeed = 100; // ms entre frames (menor = más rápido)

const scoreEl = document.getElementById('score');
const bestEl = document.getElementById('best');
const btnRestart = document.getElementById('btnRestart');
const speedRange = document.getElementById('speedRange');

// Inicializar high score desde localStorage
function loadBest() {
  const stored = localStorage.getItem('snake_best');
  best = stored ? parseInt(stored, 10) : 0;
  bestEl.textContent = best;
}

// Guardar high score
function saveBest() {
  localStorage.setItem('snake_best', String(best));
}

// Inicializa el juego
function init() {
  snake = [{ x: 9 * box, y: 10 * box }]; // cabeza inicial
  direction = 'LEFT'; // ahora empieza hacia la izquierda
  score = 0;
  scoreEl.textContent = score;
  placeFood();
  gameSpeed = parseInt(speedRange.value, 10);
  restartLoop();
}

// Coloca la comida en una celda vacía (evita solaparse con la serpiente)
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

// Dibuja todo
function draw() {
  // fondo
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // comida
  ctx.fillStyle = 'red';
  ctx.fillRect(food.x, food.y, box, box);

  // serpiente (cabeza, cuerpo, cola diferentes)
  for (let i = 0; i < snake.length; i++) {
    if (i === 0) {
      ctx.fillStyle = '#2ecc71'; // cabeza verde claro
    } else if (i === snake.length - 1) {
      ctx.fillStyle = '#f1c40f'; // cola amarilla
    } else {
      ctx.fillStyle = '#1abc9c'; // cuerpo verde más oscuro
    }
    ctx.fillRect(snake[i].x, snake[i].y, box, box);
    ctx.strokeStyle = '#061';
    ctx.strokeRect(snake[i].x, snake[i].y, box, box);
  }

  // Lógica movimiento
  const head = { x: snake[0].x, y: snake[0].y };
  if (direction === 'LEFT') head.x -= box;
  if (direction === 'RIGHT') head.x += box;
  if (direction === 'UP') head.y -= box;
  if (direction === 'DOWN') head.y += box;

  // Comer comida
  const ateFood = head.x === food.x && head.y === food.y;
  if (ateFood) {
    score += 1;
    scoreEl.textContent = score;
    if (score % 3 === 0 && gameSpeed > 40) {
      gameSpeed = Math.max(40, gameSpeed - 8);
      restartLoop();
    }
    placeFood();
  } else {
    snake.pop();
  }

  // insertar nueva cabeza
  snake.unshift(head);

  // colisiones con paredes
  if (head.x < 0 || head.x >= canvas.width || head.y < 0 || head.y >= canvas.height) {
    endGame();
    return;
  }

  // colisión con cuerpo
  for (let i = 1; i < snake.length; i++) {
    if (head.x === snake[i].x && head.y === snake[i].y) {
      endGame();
      return;
    }
  }
}

// Manejo de dirección
function changeDirection(e) {
  const key = e.key;
  if ((key === 'ArrowLeft' || key === 'a' || key === 'A') && direction !== 'RIGHT') {
    direction = 'LEFT';
  } else if ((key === 'ArrowUp' || key === 'w' || key === 'W') && direction !== 'DOWN') {
    direction = 'UP';
  } else if ((key === 'ArrowRight' || key === 'd' || key === 'D') && direction !== 'LEFT') {
    direction = 'RIGHT';
  } else if ((key === 'ArrowDown' || key === 's' || key === 'S') && direction !== 'UP') {
    direction = 'DOWN';
  }
}

// Final del juego
function endGame() {
  clearInterval(gameInterval);
  if (score > best) {
    best = score;
    saveBest();
    bestEl.textContent = best;
  }
  setTimeout(() => {
    alert(`¡Game Over!\nPuntuación: ${score}\nMejor puntuación: ${best}`);
  }, 50);
}

// (Re)iniciar loop
function restartLoop() {
  if (gameInterval) clearInterval(gameInterval);
  gameInterval = setInterval(draw, gameSpeed);
}

// Listeners
document.addEventListener('keydown', changeDirection);
btnRestart.addEventListener('click', () => init());
speedRange.addEventListener('input', (e) => {
  gameSpeed = parseInt(e.target.value, 10);
  restartLoop();
});

// iniciar
loadBest();
init();
