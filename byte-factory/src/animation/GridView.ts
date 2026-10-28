import Konva from 'konva';
import { Direction, GridMap, Position } from '../interpreter/types';
import { RobotView } from './TracePlayer';

const COLORS = {
  floor: '#2b3a33',
  floorLine: '#1d2823',
  wall: '#56616e',
  goal: '#f1c40f',
  robot: '#5fd3e6',
  robotOutline: '#14181f',
  bump: '#e74c3c',
};

/** Draws the grid and the robot with Konva, and animates the robot for TracePlayer. */
export class GridView implements RobotView {
  private readonly stage: Konva.Stage;
  private readonly layer = new Konva.Layer();
  private readonly robot = new Konva.Group();
  private readonly robotBody: Konva.Rect;

  constructor(
    container: HTMLDivElement,
    private readonly map: GridMap,
    private readonly tile = 48,
  ) {
    this.stage = new Konva.Stage({
      container,
      width: map.width * tile,
      height: map.height * tile,
    });
    this.stage.add(this.layer);
    this.drawGrid();

    const pad = tile * 0.15;
    this.robotBody = new Konva.Rect({
      x: pad,
      y: pad,
      width: tile - pad * 2,
      height: tile - pad * 2,
      fill: COLORS.robot,
      stroke: COLORS.robotOutline,
      strokeWidth: 3,
      cornerRadius: 4,
    });
    const eye = (x: number) =>
      new Konva.Rect({ x, y: tile * 0.35, width: tile * 0.12, height: tile * 0.12, fill: COLORS.robotOutline });
    this.robot.add(this.robotBody, eye(tile * 0.32), eye(tile * 0.56));
    this.layer.add(this.robot);
    this.reset(map.start);
  }

  reset(position: Position): void {
    this.robot.position(this.toPixels(position));
    this.robotBody.fill(COLORS.robot);
  }

  moveTo(to: Position, durationMs: number): Promise<void> {
    return this.tween({ ...this.toPixels(to), duration: durationMs / 1000 });
  }

  /** Lunge a quarter tile toward the obstacle, flash red, then settle back. */
  async bump(direction: Direction, durationMs: number): Promise<void> {
    const home = this.robot.position();
    const nudge = this.tile * 0.25;
    const offset = {
      up: { x: 0, y: -nudge },
      down: { x: 0, y: nudge },
      right: { x: nudge, y: 0 },
      left: { x: -nudge, y: 0 },
    }[direction];
    const half = durationMs / 2000;

    this.robotBody.fill(COLORS.bump);
    await this.tween({ x: home.x + offset.x, y: home.y + offset.y, duration: half });
    await this.tween({ x: home.x, y: home.y, duration: half });
  }

  destroy(): void {
    this.stage.destroy();
  }

  private drawGrid(): void {
    const { tile, map } = this;
    for (let y = 0; y < map.height; y++) {
      for (let x = 0; x < map.width; x++) {
        const isWall = map.walls.some((w) => w.x === x && w.y === y);
        this.layer.add(
          new Konva.Rect({
            x: x * tile,
            y: y * tile,
            width: tile,
            height: tile,
            fill: isWall ? COLORS.wall : COLORS.floor,
            stroke: COLORS.floorLine,
            strokeWidth: 1,
          }),
        );
      }
    }
    const goal = this.toPixels(map.goal);
    this.layer.add(
      new Konva.Star({
        x: goal.x + tile / 2,
        y: goal.y + tile / 2,
        numPoints: 5,
        innerRadius: tile * 0.15,
        outerRadius: tile * 0.32,
        fill: COLORS.goal,
      }),
    );
  }

  private toPixels(pos: Position): { x: number; y: number } {
    return { x: pos.x * this.tile, y: pos.y * this.tile };
  }

  private tween(config: { x: number; y: number; duration: number }): Promise<void> {
    return new Promise((resolve) => {
      const tween = new Konva.Tween({
        node: this.robot,
        ...config,
        onFinish: () => {
          tween.destroy();
          resolve();
        },
      });
      tween.play();
    });
  }
}
