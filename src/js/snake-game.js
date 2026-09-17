export class SnakeGame {
  constructor() {
    this.canvas = document.getElementById('snake-canvas');
    this.ctx = this.canvas?.getContext('2d');
    this.grid = 15;
    this.active = false;
    document.getElementById('btn-close-snake')?.addEventListener('click', () => this.stop());
    document.addEventListener('keydown', (event) => this.handleKey(event));
  }

  handleKey(event) {
    if (!this.active) return;
    const directions = {
      ArrowLeft: [-this.grid, 0], ArrowUp: [0, -this.grid],
      ArrowRight: [this.grid, 0], ArrowDown: [0, this.grid]
    };
    const next = directions[event.key];
    if (!next || (next[0] && this.snake.dx) || (next[1] && this.snake.dy)) return;
    [this.snake.dx, this.snake.dy] = next;
  }

  start() {
    if (!this.ctx) return;
    this.active = true;
    this.count = 0;
    this.score = 0;
    this.snake = { x: 150, y: 150, dx: this.grid, dy: 0, cells: [], maxCells: 4 };
    this.placeApple();
    document.getElementById('snake-score').textContent = '0';
    this.loop();
  }

  stop() {
    this.active = false;
    document.getElementById('modal-snake')?.classList.remove('active');
  }

  placeApple() {
    this.apple = {
      x: Math.floor(Math.random() * (this.canvas.width / this.grid)) * this.grid,
      y: Math.floor(Math.random() * (this.canvas.height / this.grid)) * this.grid
    };
  }

  loop() {
    if (!this.active) return;
    requestAnimationFrame(() => this.loop());
    if (++this.count < 6) return;
    this.count = 0;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.snake.x = (this.snake.x + this.snake.dx + this.canvas.width) % this.canvas.width;
    this.snake.y = (this.snake.y + this.snake.dy + this.canvas.height) % this.canvas.height;
    this.snake.cells.unshift({ x: this.snake.x, y: this.snake.y });
    if (this.snake.cells.length > this.snake.maxCells) this.snake.cells.pop();
    this.ctx.fillStyle = 'red';
    this.ctx.fillRect(this.apple.x, this.apple.y, this.grid - 1, this.grid - 1);
    this.ctx.fillStyle = 'lime';
    this.snake.cells.forEach((cell) => {
      this.ctx.fillRect(cell.x, cell.y, this.grid - 1, this.grid - 1);
      if (cell.x === this.apple.x && cell.y === this.apple.y) {
        this.snake.maxCells += 1;
        this.score += 10;
        document.getElementById('snake-score').textContent = String(this.score);
        this.placeApple();
      }
    });
  }
}
