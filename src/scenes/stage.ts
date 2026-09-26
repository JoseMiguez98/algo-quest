import type { Step } from '../core/types';
import type { StageRenderer } from '../themes/contract';
import { ease, type Scene } from './scene';

/** Owns the visible canvas and keeps it sized to its container in device pixels. */
export class Stage<S = unknown> {
  readonly canvas = document.createElement('canvas');
  private readonly observer: ResizeObserver;
  private last: { step: Step<S>; prev?: Step<S>; t: number } | null = null;

  constructor(
    readonly host: HTMLElement,
    private renderer: StageRenderer,
    private scene: Scene<S>,
  ) {
    this.canvas.className = 'stage-canvas';
    this.canvas.setAttribute('role', 'img');
    host.append(this.canvas);
    this.observer = new ResizeObserver(() => this.resize());
    this.observer.observe(host);
    this.resize();
  }

  setRenderer(renderer: StageRenderer): void {
    this.renderer = renderer;
    this.redraw();
  }

  setScene(scene: Scene<S>): void {
    this.scene = scene;
    this.redraw();
  }

  get logicalSize(): { width: number; height: number } {
    const aspect = this.canvas.width / Math.max(1, this.canvas.height);
    const h = this.scene.logicalHeight;
    const w = Math.round(Math.min(this.scene.maxWidth, Math.max(this.scene.minWidth, h * aspect)));
    return { width: w, height: h };
  }

  render(step: Step<S>, prev: Step<S> | undefined, t: number): void {
    this.last = { step, prev, t };
    const { width, height } = this.logicalSize;
    this.renderer.begin(width, height);
    this.scene.draw(this.renderer, { step, prev, t: ease(t), width, height });
    this.renderer.present(this.canvas);
  }

  redraw(): void {
    if (this.last) this.render(this.last.step, this.last.prev, this.last.t);
  }

  destroy(): void {
    this.observer.disconnect();
    this.canvas.remove();
  }

  private resize(): void {
    const dpr = window.devicePixelRatio || 1;
    const { width, height } = this.host.getBoundingClientRect();
    this.canvas.width = Math.max(1, Math.round(width * dpr));
    this.canvas.height = Math.max(1, Math.round(height * dpr));
    this.canvas.style.width = `${width}px`;
    this.canvas.style.height = `${height}px`;
    this.redraw();
  }
}
