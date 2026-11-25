import Konva from 'konva';
import type { View } from './View';
import robotUrl from '../../../assets/byte-robot-24.png';

/** The home screen's robot illustration. Buttons and text live in the HTML. */
export class MenuScreenView implements View {
  private readonly group = new Konva.Group();
  private readonly robot = new Konva.Group({ x: 84, y: 52 });
  private animation: Konva.Animation | null = null;

  constructor() {
    // A simple factory platform beneath Byte.
    this.group.add(new Konva.Rect({
      x: 36, y: 270, width: 288, height: 24,
      fill: '#56616e', stroke: '#17231b', strokeWidth: 4,
    }));
    for (let x = 44; x < 320; x += 24) {
      this.group.add(new Konva.Rect({
        x, y: 276, width: 12, height: 12, fill: '#27373a',
      }));
    }
    this.group.add(new Konva.Ellipse({
      x: 180, y: 260, radiusX: 78, radiusY: 9,
      fill: '#030906',
    }));

    const image = new Image();
    this.robot.add(new Konva.Image({
      width: 192, height: 192, image: image,
    }));
    this.group.add(this.robot);
    image.onload = () => {
      this.group.getLayer()?.batchDraw();
    };
    image.src = robotUrl;
  }

  startAnimation(layer: Konva.Layer): void {
    this.stopAnimation();
    this.animation = new Konva.Animation((frame) => {
      if (frame) {
        this.robot.y(52 + Math.round(Math.sin(frame.time / 450) * 4));
      }
    }, layer);
    this.animation.start();
  }

  stopAnimation(): void {
    this.animation?.stop();
    this.animation = null;
  }

  getGroup(): Konva.Group {
    return this.group;
  }

  show(): void {
    this.group.show();
  }

  hide(): void {
    this.stopAnimation();
    this.group.hide();
  }
}
