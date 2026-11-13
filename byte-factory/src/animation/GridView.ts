import Konva from 'konva';
import { Direction, GridMap, Position } from '../interpreter/types';
import { RobotView } from './TracePlayer';
import floorUrl from '../../assets/byte-floor-24.png';
import wallUrl from '../../assets/byte-wall-24.png';
import goalUrl from '../../assets/byte-goal-marker-24.png';
import robotUrl from '../../assets/byte-robot-24.png';

const COLORS = {
  bump: '#e74c3c',
};

/** Draws the grid and the robot with Konva, and animates the robot for TracePlayer. */
export class GridView implements RobotView {
  private readonly stage: Konva.Stage;
  private readonly layer = new Konva.Layer();
  private readonly robot = new Konva.Group();
  private readonly collisionOverlay: Konva.Rect;
  private readonly floorImage = new Image();
  private readonly wallImage = new Image();
  private readonly goalImage = new Image();
  private readonly robotImage = new Image();

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

    this.layer.imageSmoothingEnabled(false);

    this.floorImage.onload = () => {
      this.layer.batchDraw();
    }

    this.floorImage.src = floorUrl;

    this.wallImage.onload = () => {
      this.layer.batchDraw();
    };

    this.wallImage.src = wallUrl;

    this.goalImage.onload = () => {
      this.layer.batchDraw();
    };

    this.goalImage.src = goalUrl;

    this.robotImage.onload = () => {
      this.layer.batchDraw();
    }

    this.robotImage.src = robotUrl;

    this.drawGrid();

    const robotSprite = new Konva.Image({
      x: 0,
      y: 0,
      width: tile,
      height: tile,
      image: this.robotImage,
    });

    this.collisionOverlay = new Konva.Rect({
      x: 0,
      y: 0,
      width: tile,
      height: tile,
      fill: COLORS.bump,
      opacity: 0,
    });

    this.robot.add(robotSprite, this.collisionOverlay);
    this.layer.add(this.robot);
    this.reset(map.start);
  }

  reset(position: Position): void {
    this.robot.position(this.toPixels(position));
    this.collisionOverlay.opacity(0);
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

    this.collisionOverlay.opacity(0.5);
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
        if (isWall) {
          this.layer.add(
              new Konva.Image({
                x: x * tile,
                y: y * tile,
                width: tile,
                height: tile,
                image: this.wallImage,
              }),
            );
        } else {
          this.layer.add(
            new Konva.Image({
              x: x * tile,
              y: y * tile,
              width: tile,
              height: tile,
              image: this.floorImage,
            }),
          );
        }
      }
    }
    const goal = this.toPixels(map.goal);
    this.layer.add(
      new Konva.Image({
        x: goal.x,
        y: goal.y,
        width: tile,
        height: tile,
        image: this.goalImage,
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
