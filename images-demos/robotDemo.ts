import Konva from 'konva';

const PX = 6; // size of pixels of screen, asked google.

const PALETTE: Record<string, string> = {
  o: '#1b2a4a', // robot outline
  b: '#8fc4ff', // clr light blue
  d: '#4f86d6', // clr darker blue
  w: '#ffffff', // clr white
  k: '#000000', // eyes
};
//structure, if not correct might change it
const BODY = [
  '.......oo.......',
  '......obbo......',
  '.......oo.......',
  '.......oo.......',
  '..oooooooooooo..', 
  '.obbbbbbbbbbbbo.',
  'obbbbbbbbbbbbbbo',
  'obbbkkbbbbkkbbbo',
  'obbbkkbbbbkkbbbo',
  'obbbbbbbbbbbbbbo',
  'obbbbbwwwwbbbbbo',
  '.obbbbbbbbbbbbo.',
  '..oooooooooooo..',
  '..oddddddddddo..',
  '..odwwwwwwwwdo..',
  '..odwoooooowdo..',
  '..odwwwwwwwwdo..',
  '..odwoooooowdo..',
  '..odwwwwwwwwdo..',
  '..oddddddddddo..',
  '...oooooooooo...',
  '..oddo....oddo..',
  '..oooo....oooo..',
];

const ARM = [
  '.oooooooo.',
  'obbbbbbbbo', //arm
  'obbbbbbbbo',
  '.oooooooo.',
];
//group everything together 
function pixelGroup(map: string[]): Konva.Group {
  const g = new Konva.Group({ listening: false });
  map.forEach((row, y) => {
    [...row].forEach((c, x) => {
      if (c === '.') return;
      g.add(
        new Konva.Rect({
          x: x * PX, 
          y: y * PX,
          width: PX,
          height: PX,
          fill: PALETTE[c],
        })
      );
    });
  });
  return g;
}

//creating stage 
export type DemoBuilder = (
  group: Konva.Group,
  width: number,
  height: number
) => (() => void) | void; 

export class RobotDemo {
  stage: Konva.Stage;
  private demoLayer = new Konva.Layer();
  private robotLayer = new Konva.Layer();
  private demoGroup = new Konva.Group();
  private robot = new Konva.Group();
  private arm: Konva.Group;
  private cleanup?: () => void;
  private anim: Konva.Animation;

  readonly panel: { x: number; y: number; w: number; h: number };

  constructor(containerId: string, width = 520, height = 348) {
    this.stage = new Konva.Stage({ container: containerId, width, height });
    this.panel = { x: 130, y: 20, w: width - 150, h: height - 100 };

    const p = this.panel;
    this.demoLayer.add(
      new Konva.Rect({
        ...{ x: p.x, y: p.y, width: p.w, height: p.h },
        fill: '#050a0a',
        stroke: '#cfd8dc',
        strokeWidth: 2,
        cornerRadius: 12,
      })
    );
    this.demoGroup.setAttrs({
      x: p.x,
      y: p.y,
      clip: { x: 0, y: 0, width: p.w, height: p.h },
    });
    this.demoLayer.add(this.demoGroup);

    const robotH = BODY.length * PX;
    this.robot.position({ x: 10, y: height - robotH - 10 });
    this.robot.add(pixelGroup(BODY));

    this.arm = pixelGroup(ARM);
    this.arm.position({ x: 13.5 * PX, y: 16 * PX });
    this.arm.offset({ x: 0, y: (ARM.length * PX) / 2 });
    this.robot.add(this.arm);

    this.robotLayer.add(this.robot);
    this.stage.add(this.demoLayer, this.robotLayer);

    this.pointAt(p.x + 30, p.y + p.h - 30);

    const baseY = this.robot.y();
    this.anim = new Konva.Animation((frame) => {
      if (!frame) return;
      this.robot.y(baseY + Math.sin(frame.time / 350) * 3);
    }, this.robotLayer);
    this.anim.start();
  }

  pointAt(targetX: number, targetY: number) {
    const sx = this.robot.x() + this.arm.x();
    const sy = this.robot.y() + this.arm.y();
    this.arm.rotation((Math.atan2(targetY - sy, targetX - sx) * 180) / Math.PI);
  }

  showLevel(build: DemoBuilder) {
    this.cleanup?.();
    this.demoGroup.destroyChildren();
    this.cleanup =
      build(this.demoGroup, this.panel.w, this.panel.h) || undefined;
    this.demoLayer.batchDraw();
  }

  destroy() {
    this.cleanup?.();
    this.anim.stop();
    this.stage.destroy();
  }
}

export const exampleMoveDemo: DemoBuilder = (g, w, h) => {
  g.add(new Konva.Rect({ x: 20, y: h / 2 + 20, width: w - 40, height: 10, fill: '#37474f' }));
  const box = new Konva.Rect({
    x: 20, y: h / 2 - 20, width: 40, height: 40,
    fill: '#8fc4ff', stroke: '#fff', strokeWidth: 2,
  });
  g.add(box);

  const tween = new Konva.Tween({
    node: box, x: w - 60, duration: 2, easing: Konva.Easings.EaseInOut,
    onFinish: () => tween.reset() && tween.play(),
  });
  tween.play();
  return () => tween.destroy();
};