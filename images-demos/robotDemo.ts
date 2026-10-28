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
//helper func
const demoLabel = (g: Konva.Group, text: string) =>
  g.add(new Konva.Text({ x: 14, y: 10, text, fontSize: 12, fill: '#8fc4ff', fontFamily: 'monospace' }));

const belt = (g: Konva.Group, x: number, y: number, w: number) =>
  g.add(new Konva.Rect({ x, y, width: w, height: 10, fill: '#37474f', cornerRadius: 3 }));

const crate = (fill: string) =>
  new Konva.Rect({ width: 36, height: 36, offsetY: 36, fill, stroke: '#fff', strokeWidth: 2, cornerRadius: 3 });

//animation demo, blocks movin 
export const repeatDemo: DemoBuilder = (g, w, h) => {
  demoLabel(g, 'repeat 5 times: make crate');
  belt(g, 20, h / 2 + 20, w - 40);
  const counter = new Konva.Text({ x: w - 70, y: 10, text: '0 / 5', fontSize: 12, fill: '#fff', fontFamily: 'monospace' });
  g.add(counter);
  let n = 0;
  let live = true;
  const spawn = () => {
    if (!live) return;
    if (n === 5) {
      n = 0;
      g.getChildren((node: Konva.Node) => node.getAttr('isCrate')).forEach((c: Konva.Node) => c.destroy());
    }
    n++;
    counter.text(n + ' / 5');
    const b = crate('#4f86d6');
    b.setAttr('isCrate', true);
    b.position({ x: 20, y: h / 2 + 20 });
    g.add(b);
    new Konva.Tween({ node: b, x: 20 + (n - 1) * 44 + 20, duration: 0.5, easing: Konva.Easings.EaseOut }).play();
  };
  spawn();
  const timer = setInterval(spawn, 800);
  return () => { live = false; clearInterval(timer); };
};

//third slide animation
export const ifDemo: DemoBuilder = (g, w, h) => {
  demoLabel(g, 'if blue: top belt, else: bottom');
  const y0 = h / 2 - 10;
  belt(g, 20, y0 + 10, w / 2 - 20);
  belt(g, w / 2 + 20, y0 - 40, w / 2 - 40);
  belt(g, w / 2 + 20, y0 + 60, w / 2 - 40);
  let live = true;
  let flip = false;
  let tw: Konva.Tween | undefined;
  const run = () => {
    if (!live) return;
    flip = !flip;
    const b = crate(flip ? '#8fc4ff' : '#ff9f68');
    b.position({ x: 20, y: y0 + 10 });
    g.add(b);
    tw = new Konva.Tween({
      node: b, x: w / 2 + 10, duration: 1,
      onFinish: () => {
        tw = new Konva.Tween({
          node: b, x: w - 56, y: flip ? y0 - 40 : y0 + 60, duration: 1,
          onFinish: () => { b.destroy(); run(); },
        });
        tw.play();
      },
    });
    tw.play();
  };
  run();
  return () => { live = false; tw?.destroy(); };
};
