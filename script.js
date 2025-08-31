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
let gameSpeed = 300;

const scoreEl = document.getElementById('score');
const bestEl = document.getElementById('best');
const btnRestart = document.getElementById('btnRestart');
const speedRange = document.getElementById('speedRange');

let snakeHeadColor, snakeTailColor, snakeBodyColor, strokeColor, foodColor;

let gameStarted = false;

let themeIndex = 0;

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

// Aplicar tema y asignar colores para serpiente y comida según el tema
function applyTheme() {
  if (themeIndex === 0) {
    document.documentElement.style.setProperty('--bg', '#111');
    document.documentElement.style.setProperty('--panel', '#161616');
    document.documentElement.style.setProperty('--accent', '#2ecc71');
    document.documentElement.style.setProperty('--danger', '#e74c3c');
    document.documentElement.style.setProperty('--text', '#eee');
    document.documentElement.style.setProperty('--muted', '#a9a9a9');
    canvas.style.backgroundColor = '#000';

    snakeHeadColor = '#2ecc71';
    snakeTailColor = '#f1c40f';
    snakeBodyColor = '#1abc9c';
    strokeColor = '#061';
    foodColor = '#e23623ff';

  } else if (themeIndex === 1) {
    document.documentElement.style.setProperty('--bg', '#fff');
    document.documentElement.style.setProperty('--panel', '#eee');
    document.documentElement.style.setProperty('--accent', '#1ba856ff');
    document.documentElement.style.setProperty('--danger', '#e74c3c');
    document.documentElement.style.setProperty('--text', '#111');
    document.documentElement.style.setProperty('--muted', '#666');
    canvas.style.backgroundColor = '#fff';

    snakeHeadColor = '#2ecc71';
    snakeTailColor = '#f1c40f';
    snakeBodyColor = '#1abc9c';
    strokeColor = '#061';
    foodColor = '#e23623ff';

  } else if (themeIndex === 2) {
    document.documentElement.style.setProperty('--bg', '#001f3f');
    document.documentElement.style.setProperty('--panel', '#003366');
    document.documentElement.style.setProperty('--accent', '#3dd87eff');
    document.documentElement.style.setProperty('--danger', '#e74c3c');
    document.documentElement.style.setProperty('--text', '#DDDDFF');
    document.documentElement.style.setProperty('--muted', '#99AAFF');
    canvas.style.backgroundColor = '#001f3f';

    snakeHeadColor = '#2ecc71';
    snakeTailColor = '#f1c40f';
    snakeBodyColor = '#1abc9c';
    strokeColor = '#061';
    foodColor = '#e23623ff';
  }
}

// Inicializa
function init() {
  snake = [{ x: 9 * box, y: 10 * box }];
  direction = null;
  score = 0;
  scoreEl.textContent = score;
  placeFood();
  gameSpeed = parseInt(speedRange.value, 10);

  // Ocultar modal al iniciar/reiniciar juego
  const modal = document.getElementById('gameOverModal');
  modal.classList.add('hidden');

  gameStarted = false;
  restartLoop();

  document.getElementById('closeGameOver').addEventListener('click', () => {
  const modal = document.getElementById('gameOverModal');
  modal.classList.add('hidden');
  init();
});
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
  if (themeIndex === 0) ctx.fillStyle = '#000';
  else if (themeIndex === 1) ctx.fillStyle = '#fff';
  else ctx.fillStyle = '#001f3f';

  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Comida
  ctx.fillStyle = foodColor;
  ctx.fillRect(food.x, food.y, box, box);

  // Serpiente
  for (let i = 0; i < snake.length; i++) {
    if (i === 0) ctx.fillStyle = snakeHeadColor;
    else if (i === snake.length - 1) ctx.fillStyle = snakeTailColor;
    else ctx.fillStyle = snakeBodyColor;
    ctx.fillRect(snake[i].x, snake[i].y, box, box);
    ctx.strokeStyle = strokeColor;
    ctx.strokeRect(snake[i].x, snake[i].y, box, box);
  }

  if (!gameStarted) return; // No mover la serpiente si no empezó el juego

  // Movimiento
  const head = { x: snake[0].x, y: snake[0].y };
  if (direction === 'LEFT') head.x -= box;
  if (direction === 'RIGHT') head.x += box;
  if (direction === 'UP') head.y -= box;
  if (direction === 'DOWN') head.y += box;

  // Comer
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

  // Colisiones
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

// Fin del juego
function endGame() {
  clearInterval(gameInterval);
  gameStarted = false;
  if (score > best) {
    best = score;
    saveBest();
    bestEl.textContent = best;
  }

  // Mostrar cuadro emergente Game Over
  const modal = document.getElementById('gameOverModal');
  modal.classList.remove('hidden');
}

// Bucle
function restartLoop() {
  if (gameInterval) clearInterval(gameInterval);
  gameInterval = setInterval(draw, gameSpeed);
}

// Botón cambio de tema
const themeToggleBtn = document.createElement('button');
themeToggleBtn.textContent = 'Cambiar tema';
themeToggleBtn.style.marginLeft = '10px';
themeToggleBtn.style.cursor = 'pointer';
document.querySelector('.controls').appendChild(themeToggleBtn);

// Cambiar tema al hacer clic, rotando entre 0,1,2
themeToggleBtn.addEventListener('click', () => {
  themeIndex = (themeIndex + 1) % 3;
  applyTheme();
  draw();
});

// Control de dirección (faltaba asegurar que la función está incluida)
function changeDirection(event) {
  const key = event.key.toUpperCase();

  if ((key === 'ARROWLEFT' || key === 'A') && direction !== 'RIGHT') direction = 'LEFT';
  else if ((key === 'ARROWRIGHT' || key === 'D') && direction !== 'LEFT') direction = 'RIGHT';
  else if ((key === 'ARROWUP' || key === 'W') && direction !== 'DOWN') direction = 'UP';
  else if ((key === 'ARROWDOWN' || key === 'S') && direction !== 'UP') direction = 'DOWN';

  gameStarted = true;
}

// Listeners
document.addEventListener('keydown', changeDirection);
btnRestart.addEventListener('click', () => init());
speedRange.addEventListener('input', (e) => {
  const val = parseInt(e.target.value, 10);
  gameSpeed = 260 - val;
  restartLoop();
});

applyTheme();
loadBest();
init();