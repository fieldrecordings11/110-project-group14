import { Direction, Position, TraceStep } from '../interpreter/types';

/** What the player needs from a view. GridView implements this with Konva. */
export interface RobotView {
  moveTo(to: Position, durationMs: number): Promise<void>;
  bump(direction: Direction, durationMs: number): Promise<void>;
  reset(position: Position): void;
}

export type PlaybackResult = 'finished' | 'stopped';

export type PlayOptions = {
  /** Time for one step at normal speed. */
  stepMs?: number;
  /** Called just before each step animates, e.g. to highlight its block. */
  onStep?: (step: TraceStep, index: number) => void;
};

/** Plays an interpreter trace on a view, one step after another. */
export class TracePlayer {
  // Bumped on every play/stop so an older playback notices it was replaced.
  private runId = 0;

  constructor(private readonly view: RobotView) {}

  async play(trace: TraceStep[], start: Position, options: PlayOptions = {}): Promise<PlaybackResult> {
    const runId = ++this.runId;
    const stepMs = options.stepMs ?? 300;
    this.view.reset(start);

    for (let i = 0; i < trace.length; i++) {
      if (runId !== this.runId) return 'stopped';
      const step = trace[i];
      options.onStep?.(step, i);
      if (step.kind === 'move') await this.view.moveTo(step.to, stepMs);
      else await this.view.bump(step.direction, stepMs);
    }
    return runId === this.runId ? 'finished' : 'stopped';
  }

  stop(): void {
    this.runId += 1;
  }
}
