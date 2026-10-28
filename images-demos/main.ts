import { RobotDemo, exampleMoveDemo, repeatDemo, ifDemo } from './robotDemo';

const robot = new RobotDemo('demo-container');
const levels = [exampleMoveDemo, repeatDemo, ifDemo];
let index = 0;

const show = () => {
  robot.showLevel(levels[index]);
  robot.pointAt(robot.panel.x + robot.panel.w / 2, robot.panel.y + robot.panel.h / 2);
  const count = document.getElementById('count');
  if (count) count.textContent = `${index + 1}/${levels.length}`;
};

document.getElementById('prev')?.addEventListener('click', () => {
  index = (index + levels.length - 1) % levels.length;
  show();
});
document.getElementById('next')?.addEventListener('click', () => {
  index = (index + 1) % levels.length;
  show();
});

show();
