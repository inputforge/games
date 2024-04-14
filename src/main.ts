import './main.css';
import {Snake} from "./scenes/snake.ts";
import {Coordinator} from "./coordinator.ts";
import {GameOver} from "./scenes/game-over.ts";
import {Intro} from "./scenes/intro.ts";

document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('canvas') as HTMLCanvasElement;
  const viewPortSize = Math.min(window.innerWidth, window.innerHeight);
  const grids = 20;
  const gridSize = Math.floor(viewPortSize / grids);

  canvas.width = gridSize * grids;
  canvas.height = gridSize * grids;


  const coordinator = new Coordinator(canvas);

  coordinator.register('snake', ({
                                   grids,
                                   gridSize,
                                   speed
                                 }) => new Snake(coordinator, {grids, gridSize, speed}), {
    grids,
    gridSize,
    speed: 250
  });
  coordinator.register('intro', () => new Intro(coordinator, {grids, gridSize, speed: 250}));
  coordinator.register('gameover', ({score}) => new GameOver(coordinator, {score}), {score: 0});

  const scoreElement = document.querySelector('#score') as HTMLSpanElement;
  coordinator.on('score', (score) => {
    scoreElement.innerText = score;
    console.log(score);
  });

  coordinator.change('intro');

  document.querySelector('#new-game')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const speed = parseInt((document.querySelector('#speed') as HTMLInputElement).value);
    coordinator.change('snake', {grids, gridSize, speed: 50 * (11 - speed)});
  });
});