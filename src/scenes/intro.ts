import {Scene} from "../coordinator.ts";
import {wrap} from "../utils.ts";

type IntroParams = {
  grids: number;
  gridSize: number;
  speed: number;
}

export class Intro extends Scene<IntroParams> {

  private lastMoveTime: DOMHighResTimeStamp = -1;
  private snake: number[] = [0, 1, 2, 3, 4, 5];

  update(time: DOMHighResTimeStamp): void {
    if (time - this.lastMoveTime > this.params.speed) {
      this.lastMoveTime = time;
      const x = this.snake[this.snake.length - 1];
      this.snake.push(wrap(x + 1, 0, this.params.grids - 1));
      this.snake.shift();
    }
  }

  draw(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, this.coordinator.screen.width, this.coordinator.screen.height);

    ctx.fillStyle = 'red';
    ctx.font = '60px "Press Start 2P"';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Snake', this.coordinator.screen.width / 2, this.coordinator.screen.height / 2 - 40);

    const y = this.coordinator.screen.height / 2 + 40;
    ctx.fillStyle = '#0088cc';
    for (let i = 0; i < this.snake.length - 1; i++) {
      ctx.fillRect(this.snake[i] * this.params.gridSize, y, this.params.gridSize, this.params.gridSize);
    }

    ctx.fillStyle = 'white';
    ctx.beginPath();
    const x = this.snake[this.snake.length - 1];
    ctx.moveTo(x * this.params.gridSize, y);
    ctx.lineTo((x + 1) * this.params.gridSize, y + this.params.gridSize);
    ctx.lineTo(x * this.params.gridSize, y + this.params.gridSize);
    ctx.fill();

    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.arc(x * this.params.gridSize + (2 * this.params.gridSize) / 4, y + (3 * this.params.gridSize / 4), this.params.gridSize / 8, 0, 2 * Math.PI);
    ctx.fill();
  }
}