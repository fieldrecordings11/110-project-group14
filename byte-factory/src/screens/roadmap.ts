import Konva from 'konva';
import './roadmap.css';

// Sample data. Replace with shared level/progress data when available.
const levels = [
  {id: '1', title: 'First steps', status: 'completed', y: 350},
  {id: '2', title: 'Repeat actions', status: 'available', y: 220},
  {id: '3', title: 'Make decisions', status: 'locked', y: 90},
];

export function showRoadmap(container: HTMLElement) {
  container.innerHTML = `
    <main class="roadmap">
      <header><p class="roadmap-brand">BYTE FACTORY</p><h1>Your factory roadmap</h1>
        <p>Choose a level to continue your robot's adventure.</p></header>
      <div class="roadmap-map">
        <div class="roadmap-canvas" aria-hidden="true"></div>
        <div class="roadmap-levels" aria-label="Levels"></div>
      </div>
      <p class="roadmap-message" role="status">Level 1 complete. Level 2 is ready to explore!</p>
      <footer><span>✓ Completed</span><span>● Available</span><span>🔒 Locked</span></footer>
    </main>`;

  const canvas = container.querySelector('.roadmap-canvas');
  const buttons = container.querySelector('.roadmap-levels');

  if (!(canvas instanceof HTMLDivElement) || !buttons) {
    return;
  }

  const stage = new Konva.Stage({container: canvas, width: 600, height: 440});
  const layer = new Konva.Layer({listening: false});
  stage.add(layer);

  layer.add(new Konva.Line({
    points: [300, 350, 300, 90], stroke: '#a6bbc0', strokeWidth: 2,
  }));
  layer.add(new Konva.Line({
    points: [175, 220, 300, 90, 425, 220], stroke: '#52686e', strokeWidth: 2,
  }));


  for (const level of levels) {
    let color = '#617178';
    if (level.status === 'completed') {
      color = '#76e2a2';
    } else if (level.status === 'available') {
      color = '#8fc4ff';
    }
    layer.add(new Konva.Circle({
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
    });
    buttons.append(button);
  }

  const robot = new Konva.Group({x: 225, y: 194});
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
}
