type Input = {
  keys: { [key: string]: boolean };
}


export abstract class Scene<T = void> {

  constructor(protected coordinator: Coordinator, protected params: T) {
  }

  begin(): void {
  }

  // @ts-ignore
  update(time: DOMHighResTimeStamp): void {
  }

  abstract draw(ctx: CanvasRenderingContext2D): void;
}

type SceneBuilder<T = void> = (params: T) => Scene<T>;

export class Coordinator {
  readonly input: Input;
  readonly screen: { width: number, height: number };
  private scenes: { [name: string]: { builder: SceneBuilder<any>, defaultParams: any } } = {};

  private renderLoopHandle: number = -1;
  private currentScene: Scene | null = null;

  private eventListeners: { [name: string]: (data: any) => void } = {};

  constructor(private canvas: HTMLCanvasElement) {
    this.input = {keys: {}};
    this.screen = {width: canvas.width, height: canvas.height};

    document.addEventListener('keydown', (event) => {
      this.input.keys[event.key] = true;
    });
    document.addEventListener('keyup', (event) => {
      this.input.keys[event.key] = false;
    });
  }

  register<T = void>(name: string, builder: SceneBuilder<T>, defaultParams: T | void) {
    this.scenes[name] = {builder, defaultParams};
  }

  change(name: string, params: any = {}) {
    const {builder, defaultParams} = this.scenes[name];
    this.currentScene = builder({...defaultParams, ...params});
    this.currentScene.begin();
    if (this.renderLoopHandle === -1) {
      this.start();
    }
  }

  emit(event: string, data: any) {
    const listener = this.eventListeners[event];
    if (listener) {
      listener(data);
    }
  }

  on(event: string, listener: (data: any) => void) {
    this.eventListeners[event] = listener;
  }

  stop() {
    if (this.renderLoopHandle !== -1) {
      cancelAnimationFrame(this.renderLoopHandle);
    }
  }

  start() {
    const ctx = this.canvas.getContext('2d');
    if (!ctx) {
      return;
    }
    ctx.reset()

    const loop = (time: DOMHighResTimeStamp) => {
      this.currentScene?.update(time);
      this.currentScene?.draw(ctx);
      this.renderLoopHandle = requestAnimationFrame(loop);
    };
    this.renderLoopHandle = requestAnimationFrame(loop);
  }
}