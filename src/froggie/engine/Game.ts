// Top-level orchestrator. Wires the renderer, clock, input and world together,
// owns the requestAnimationFrame loop, and delegates all content to the Scene.
// Deliberately thin — game logic lives in systems and scene elements, not here.

import { Clock } from "./Clock";
import { Input } from "./Input";
import { Renderer } from "./Renderer";
import { World } from "./World";
import { Scene } from "../world/Scene";
import { C } from "../config/theme";
import { ambience } from "../audio/Ambience";

export class Game {
  private readonly renderer: Renderer;
  private readonly clock = new Clock();
  private readonly input: Input;
  private readonly world: World;
  private readonly scene: Scene;

  private running = false;
  private booted = false;
  private simTime = 0; // hand-driven clock for stepOnce()
  private readonly onFirstFrame?: () => void;
  private readonly onTick?: (bugsFixed: number) => void;

  constructor(
    canvas: HTMLCanvasElement,
    onFirstFrame?: () => void,
    onTick?: (bugsFixed: number) => void
  ) {
    this.renderer = new Renderer(canvas, { targetHeight: 232 });
    this.input = new Input(canvas);
    this.world = new World(this.input);
    this.onFirstFrame = onFirstFrame;
    this.onTick = onTick;

    this.syncViewport(this.renderer.width, this.renderer.height);
    this.scene = new Scene(this.world);
    this.renderer.onResize((w, h) => {
      this.syncViewport(w, h);
      this.scene.relayout(this.world);
    });

    // Pause the loop when the tab is hidden — no point simulating an unseen
    // pond, and it keeps the delta clamp honest on return.
    document.addEventListener("visibilitychange", this.onVisibility);
  }

  private onVisibility = (): void => {
    if (document.hidden) this.stop();
    else this.start();
  };

  /** Stop the loop and release everything. The portfolio mounts the pond on a
   *  hash route, so leaving must not leave a rAF loop drawing into a detached
   *  canvas — and a surviving visibilitychange listener would restart it. */
  dispose(): void {
    this.stop();
    document.removeEventListener("visibilitychange", this.onVisibility);
    this.renderer.dispose();
    this.input.dispose();
    // Scene.installUnlock()'d these on the way in.
    ambience.uninstallUnlock();
    ambience.suspend();
  }

  private syncViewport(w: number, h: number): void {
    this.world.width = w;
    this.world.height = h;
    this.input.setViewport(this.renderer.pixelSize, w, h);
  }

  start(): void {
    if (this.running) return;
    this.running = true;
    this.clock.tick(performance.now()); // reset delta baseline
    requestAnimationFrame(this.frame);
  }

  stop(): void {
    this.running = false;
  }

  private frame = (now: number): void => {
    if (!this.running) return;
    this.clock.tick(now);
    this.draw(this.clock.elapsed, this.clock.delta);
    requestAnimationFrame(this.frame);
  };

  /** One simulate + render pass. */
  private draw(t: number, dt: number): void {
    const world = this.world;
    world.t = t;
    world.dt = dt;
    world.ctx = this.renderer.ctx;

    world.camera.update(world.t, world.dt, this.input);
    this.scene.update(world);

    this.renderer.clear(C.skyDeep);
    this.scene.render(world);

    this.onTick?.(world.progress.bugsResolved);

    if (!this.booted) {
      this.booted = true;
      this.onFirstFrame?.();
    }
  }

  /** Advance exactly one frame by hand, independent of rAF. A hidden browser
   *  tab never fires rAF, so headless verification (window.__pond.step) has to
   *  drive the pond itself. Dev-only; the real loop uses frame(). */
  stepOnce(dt = 1 / 60): void {
    this.simTime += dt;
    this.draw(this.simTime, dt);
  }
}
