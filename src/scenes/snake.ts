import {wrap} from "../utils.ts";
import {Coordinator, Scene} from "../coordinator.ts";

type Point = {
  x: number;
  y: number;
}
type Optional<T> = T | null | undefined;

type SnakeParams = {
  grids: number;
  gridSize: number;
  speed: number;
}

enum Direction {
  UP,
  DOWN,
  LEFT,
  RIGHT
}

export class Snake extends Scene<SnakeParams> {
  private score: number = 0;

  private direction: Direction = Direction.RIGHT;

  private world: number[][] = [];
  private snake: Point[] = [];

  private lastMoveTime: DOMHighResTimeStamp = -1;
  private lastFoodTime: DOMHighResTimeStamp = -1;
  private foodPosition: Optional<Point> = null;
  private lastBonusTime: DOMHighResTimeStamp = -1;
  private bonusPosition: Optional<Point> = null;

  constructor(protected coordinator: Coordinator, protected params: SnakeParams) {
    super(coordinator, params);
    const {grids} = params;
    this.snake.push({x: grids / 2, y: grids / 2});
    while (this.world.length < grids) {
      this.world.push(new Array(grids).fill(0));
    }
  }

  update(time: DOMHighResTimeStamp) {
    const keys = this.coordinator.input.keys;
    if (keys['ArrowUp'] || keys['w']) {
      this.direction = Direction.UP;
    } else if (keys['ArrowDown'] || keys['s']) {
      this.direction = Direction.DOWN;
    } else if (keys['ArrowLeft'] || keys['a']) {
      this.direction = Direction.LEFT;
    } else if (keys['ArrowRight'] || keys['d']) {
      this.direction = Direction.RIGHT;
    }

    let shift = false;

    if (time - this.lastMoveTime > this.params.speed) {
      this.lastMoveTime = time;
      const {x, y} = this.snake[this.snake.length - 1];
      const dx = [0, 0, -1, 1][this.direction];
      const dy = [-1, 1, 0, 0][this.direction];

      this.snake.push({
        x: wrap(x + dx, 0, this.params.grids - 1),
        y: wrap(y + dy, 0, this.params.grids - 1)
      });
      shift = true;
    }
    const {x, y} = this.snake[this.snake.length - 1];

    // Check if the snake has collided with itself
    for (let i = 0; i < this.snake.length - 1; i++) {
      if (x === this.snake[i].x && y === this.snake[i].y) {
        this.coordinator.change('gameover', {score: this.score});
      }
    }


    // Check if the snake has eaten the food
    if (x === this.foodPosition?.x && y === this.foodPosition?.y) {
      this.score += 1;
      this.foodPosition = null;
      shift = false;
      this.coordinator.emit('score', this.score);
    }

    // Check if the snake has eaten the bonus
    if (x === this.bonusPosition?.x && y === this.bonusPosition?.y) {
      this.score += 5;
      this.bonusPosition = null;
      shift = false;
      this.coordinator.emit('score', this.score);
    }

    // Check if food is expired
    if (time - this.lastFoodTime > 2 * this.params.grids * this.params.speed) {
      this.foodPosition = null;
    }

    // Check if bonus is expired
    if (time - this.lastBonusTime > this.params.grids * this.params.speed) {
      this.bonusPosition = null;
    }

    // Generate food
    if (!this.foodPosition) {
      this.lastFoodTime = time;
      this.foodPosition = {
        x: Math.floor(Math.random() * this.params.grids),
        y: Math.floor(Math.random() * this.params.grids),
      };
    }

    // Generate bonus
    if (!this.bonusPosition && (time - this.lastBonusTime > 5 * this.params.grids * this.params.speed)) {
      this.lastBonusTime = time;
      this.bonusPosition = {
        x: Math.floor(Math.random() * this.params.grids),
        y: Math.floor(Math.random() * this.params.grids),
      };
    }

    if (shift) {
      this.snake.shift();
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    const {grids, gridSize} = this.params;

    // Simulate screen background of a Nokia 3310
    ctx.fillStyle = '#c4fff5';
    ctx.fillRect(0, 0, grids * gridSize, grids * gridSize);

    // Draw obstacles
    ctx.fillStyle = 'brown';
    for (let i = 0; i < grids; i++) {
      for (let j = 0; j < grids; j++) {
        if (this.world[i][j] === 1) {
          ctx.fillRect(i * gridSize, j * gridSize, gridSize, gridSize);
        }
      }
    }

    // Draw food
    if (this.foodPosition) {
      ctx.fillStyle = 'green';
      ctx.fillRect(this.foodPosition.x * gridSize, this.foodPosition.y * gridSize, gridSize, gridSize);
    }

    // Draw bonus
    if (this.bonusPosition) {
      ctx.fillStyle = 'gold';
      ctx.fillRect(this.bonusPosition.x * gridSize, this.bonusPosition.y * gridSize, gridSize, gridSize);
    }

    // Draw snake
    for (let i = 0; i < this.snake.length - 1; i++) {
      ctx.fillStyle = '#0088cc';
      ctx.fillRect(this.snake[i].x * gridSize, this.snake[i].y * gridSize, gridSize, gridSize);
    }

    // Draw snake's head as a right triangle
    ctx.fillStyle = 'black';
    ctx.beginPath();
    const head = this.snake[this.snake.length - 1];
    if (this.direction === Direction.RIGHT) {
      ctx.moveTo(head.x * gridSize, head.y * gridSize);
      ctx.lineTo((head.x + 1) * gridSize, (head.y + 1) * gridSize);
      ctx.lineTo(head.x * gridSize, (head.y + 1) * gridSize);
    } else if (this.direction === Direction.LEFT) {
      ctx.moveTo((head.x + 1) * gridSize, (head.y + 1) * gridSize);
      ctx.lineTo(head.x * gridSize, (head.y + 1) * gridSize);
      ctx.lineTo((head.x + 1) * gridSize, head.y * gridSize);
    } else if (this.direction === Direction.UP) {
      ctx.moveTo(head.x * gridSize, head.y * gridSize);
      ctx.lineTo(head.x * gridSize, (head.y + 1) * gridSize);
      ctx.lineTo((head.x + 1) * gridSize, head.y * gridSize);
    } else if (this.direction === Direction.DOWN) {
      ctx.moveTo(head.x * gridSize, (head.y + 1) * gridSize);
      ctx.lineTo(head.x * gridSize, head.y * gridSize);
      ctx.lineTo((head.x + 1) * gridSize, (head.y + 1) * gridSize);
    }
    ctx.fill();

    // Add eyes to the snake's head
    ctx.fillStyle = 'white';
    ctx.beginPath();
    if (this.direction === Direction.RIGHT) {
      ctx.arc(head.x * gridSize + (2 * gridSize) / 4, head.y * gridSize + (3 * gridSize / 4), gridSize / 8, 0, 2 * Math.PI);
    } else if (this.direction === Direction.LEFT) {
      ctx.arc(head.x * gridSize + (2 * gridSize) / 4, head.y * gridSize + (3 * gridSize / 4), gridSize / 8, 0, 2 * Math.PI);
    } else if (this.direction === Direction.UP) {
      ctx.arc(head.x * gridSize + gridSize / 4, head.y * gridSize + gridSize / 4, gridSize / 8, 0, 2 * Math.PI);
    } else if (this.direction === Direction.DOWN) {
      ctx.arc(head.x * gridSize + gridSize / 4, head.y * gridSize + 3 * gridSize / 4, gridSize / 8, 0, 2 * Math.PI);
    }
    ctx.fill();
  }
}