import Konva from 'konva';
import './roadmap.css';

const activeRoadmaps = new WeakMap<HTMLElement, () => void>();

export type RoadmapLevel = {
  id: string;
  title: string;
  status: 'completed' | 'available' | 'locked';
  y: number;
};

export function getLevelStatus(
  levelId: string,
  index: number,
  levels: RoadmapLevel[],
  completedLevelIds: readonly string[],
): RoadmapLevel['status'] {
  if (completedLevelIds.indexOf(levelId) !== -1) {
    return 'completed';
  }

  if (
    index === 0 ||
    completedLevelIds.indexOf(levels[index - 1].id) !== -1
  ) {
    return 'available';
  }

  return 'locked';
}

export function showRoadmap(
  container: HTMLElement,
  levels: RoadmapLevel[],
  onSelectLevel: (levelId: string) => void,
) {
  activeRoadmaps.get(container)?.();
  container.innerHTML = `
    <main class="roadmap">
      <header><p class="roadmap-brand">BYTE FACTORY</p><h1>Your factory roadmap</h1>
        <p>Choose a level to continue your robot's adventure.</p></header>
      <div class="roadmap-map">
        <div class="roadmap-canvas" aria-hidden="true"></div>
        <div class="roadmap-levels" aria-label="Levels"></div>
      </div>
      <p class="roadmap-message" role="status"></p>
      <footer><span>✓ Completed</span><span>● Available</span><span>🔒 Locked</span></footer>
    </main>`;

  const canvas = container.querySelector('.roadmap-canvas');
  const buttons = container.querySelector('.roadmap-levels');
  const root = container.firstElementChild;
  const map = container.querySelector('.roadmap-map') as HTMLDivElement;
  const message = container.querySelector('.roadmap-message');
  const completedCount = levels.filter((level) => level.status === 'completed').length;
  const nextLevel = levels.find((level) => level.status === 'available');
  if (message) {
    message.textContent = levels.length === 0
      ? 'No levels available yet.'
      : completedCount === levels.length
        ? 'All levels complete! Choose a level to play again.'
        : nextLevel
          ? `${completedCount} of ${levels.length} levels complete. Next: ${nextLevel.title}.`
          : 'No levels are unlocked yet.';
  }

  if (!(canvas instanceof HTMLDivElement) || !buttons) {
    return () => {};
  }

  const height = Math.max(110, ...levels.map((level) => level.y)) + 90;
  map.style.height = `${height}px`;
  const stage = new Konva.Stage({container: canvas, width: 600, height});
  const layer = new Konva.Layer({listening: false});
  stage.add(layer);
  const path = new Konva.Group();
  layer.add(path);

  path.add(new Konva.Line({
    points: levels.reduce<number[]>((points, level) => points.concat(300, level.y), []),
    stroke: '#a6bbc0', strokeWidth: 2,
  }));


  for (const level of levels) {
    let color = '#617178';
    if (level.status === 'completed') {
      color = '#76e2a2';
    } else if (level.status === 'available') {
      color = '#8fc4ff';
    }
    path.add(new Konva.Circle({
      x: 300, y: level.y, radius: 29, fill: '#071412', stroke: color, strokeWidth: 3,
    }));
    const button = document.createElement('button');
    button.className = `roadmap-level roadmap-level--${level.status}`;
    button.style.top = `${level.y}px`;
    button.disabled = level.status === 'locked';
    button.setAttribute('aria-label', `Level ${level.id}: ${level.title}, ${level.status}`);
    if (level.status === 'available') {
      button.setAttribute('aria-current', 'step');
    }
    const number = document.createElement('span');
    number.className = 'roadmap-number';
    number.textContent = level.id;
    const label = document.createElement('span');
    label.className = 'roadmap-label';
    label.textContent = `${level.title} · ${level.status}`;
    button.append(number, label);
    button.addEventListener('click', () => {
      const message = container.querySelector('.roadmap-message');
      if (message) {
        message.textContent = `Level ${level.id}: ${level.title} selected.`;
      }

      onSelectLevel(level.id);
    });
    buttons.append(button);
  }

  const robot = new Konva.Group({visible: levels.length > 0});
  const head = new Konva.Rect({
    x: 0, y: 0, width: 28, height: 20, fill: '#8fc4ff',
  });
  const leftEye = new Konva.Rect({
    x: 6, y: 7, width: 4, height: 4, fill: '#071412',
  });
  const rightEye = new Konva.Rect({
    x: 18, y: 7, width: 4, height: 4, fill: '#071412',
  });
  const body = new Konva.Rect({
    x: 4, y: 24, width: 20, height: 16, fill: '#8fc4ff',
  });
  const leftLeg = new Konva.Rect({
    x: 4, y: 40, width: 6, height: 8, fill: '#8fc4ff',
  });
  const rightLeg = new Konva.Rect({
    x: 18, y: 40, width: 6, height: 8, fill: '#8fc4ff',
  });
  robot.add(head, leftEye, rightEye, body, leftLeg, rightLeg);
  layer.add(robot);

  const resize = () => {
    const width = map.clientWidth || 600;
    const center = width <= 480 ? 50 : width / 2;
    stage.width(width);
    for (const button of Array.from(buttons.children)) {
      (button as HTMLButtonElement).style.left = `${center}px`;
    }
    path.x(center - 300);
    robot.position({x: center - (width <= 480 ? 48 : 75), y: (nextLevel?.y ?? levels[0]?.y ?? 90) - 26});
    robot.scale({x: width <= 480 ? 0.65 : 1, y: width <= 480 ? 0.65 : 1});
    layer.batchDraw();
  };
  const observer = new ResizeObserver(resize);
  observer.observe(map);
  resize();

  let destroyed = false;
  const destroy = () => {
    if (destroyed) return;
    destroyed = true;
    observer.disconnect();
    stage.destroy();
    root?.remove();
    if (activeRoadmaps.get(container) === destroy) activeRoadmaps.delete(container);
  };
  activeRoadmaps.set(container, destroy);
  return destroy;
}
