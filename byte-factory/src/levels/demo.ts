import { GridMap } from '../interpreter/types';
import { Level } from '../validator/types';

/** Temporary level for trying the interpreter until real levels exist. */
export const demoLevel: Level = {
  id: 'demo',
  allowedBlocks: ['move_up', 'move_down', 'move_left', 'move_right', 'controls_repeat_ext', 'math_number'],
  blockLimit: 20,
};

export const demoMap: GridMap = {
  width: 6,
  height: 5,
  start: { x: 0, y: 0 },
  goal: { x: 4, y: 3 },
  walls: [
    { x: 2, y: 0 },
    { x: 2, y: 1 },
    { x: 4, y: 2 },
    { x: 1, y: 3 },
  ],
};
