import { describe, it, expect } from 'vitest';
import { RobotView, TracePlayer } from '../animation/TracePlayer';
import { Direction, Position, TraceStep } from '../interpreter/types';

/** Records what the player asked the view to do. */
class FakeView implements RobotView {
  calls: string[] = [];
  /** Lets a test pause inside an animation. */
  hold: Promise<void> | null = null;

  async moveTo(to: Position): Promise<void> {
    this.calls.push(`move ${to.x},${to.y}`);
    if (this.hold) await this.hold;
  }
  async bump(direction: Direction): Promise<void> {
    this.calls.push(`bump ${direction}`);
  }
  reset(position: Position): void {
    this.calls.push(`reset ${position.x},${position.y}`);
  }
}

const trace: TraceStep[] = [
  { kind: 'move', blockId: 'a', direction: 'right', from: { x: 0, y: 0 }, to: { x: 1, y: 0 } },
  { kind: 'move', blockId: 'b', direction: 'down', from: { x: 1, y: 0 }, to: { x: 1, y: 1 } },
  { kind: 'bump', blockId: 'c', direction: 'down', at: { x: 1, y: 1 }, target: { x: 1, y: 2 } },
];

describe('TracePlayer', () => {
  it('resets the robot, then plays every step in order', async () => {
    const view = new FakeView();
    const steps: string[] = [];
    const result = await new TracePlayer(view).play(trace, { x: 0, y: 0 }, {
      onStep: (step) => steps.push(step.blockId ?? ''),
    });

    expect(result).toBe('finished');
    expect(view.calls).toEqual(['reset 0,0', 'move 1,0', 'move 1,1', 'bump down']);
    expect(steps).toEqual(['a', 'b', 'c']);
  });

  it('stops part-way when stop() is called', async () => {
    const view = new FakeView();
    let release!: () => void;
    view.hold = new Promise((resolve) => (release = resolve));
    const player = new TracePlayer(view);

    const playing = player.play(trace, { x: 0, y: 0 });
    player.stop();
    release();

    expect(await playing).toBe('stopped');
    expect(view.calls).toEqual(['reset 0,0', 'move 1,0']);
  });

  it('a new play() cancels the one already running', async () => {
    const view = new FakeView();
    let release!: () => void;
    view.hold = new Promise((resolve) => (release = resolve));
    const player = new TracePlayer(view);

    const first = player.play(trace, { x: 0, y: 0 });
    view.hold = null;
    const second = player.play(trace.slice(0, 1), { x: 0, y: 0 });
    release();

    expect(await first).toBe('stopped');
    expect(await second).toBe('finished');
  });
});
