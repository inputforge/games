import {Scene} from "../coordinator.ts";

type GameOverParams = {
  score: number;
}

export class GameOver extends Scene<GameOverParams> {
  // @ts-ignore
  update(time: DOMHighResTimeStamp) {
    const keys = this.coordinator.input.keys;
    if (keys['Enter']) {
      this.coordinator.emit('score', 0);
      this.coordinator.change('snake');
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, this.coordinator.screen.width, this.coordinator.screen.height);

    ctx.fillStyle = 'red';
    ctx.font = '40px "Press Start 2P"';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Game Over', this.coordinator.screen.width / 2, this.coordinator.screen.height / 2 - 40);

    ctx.fillStyle = 'white';
    ctx.font = '20px "Press Start 2P"';
    ctx.fillText(`Score: ${this.params.score}`, this.coordinator.screen.width / 2, this.coordinator.screen.height / 2);

    ctx.font = '20px "Press Start 2P"';
    ctx.fillText('Press Enter to Restart', this.coordinator.screen.width / 2, this.coordinator.screen.height / 2 + 40);
  }
}