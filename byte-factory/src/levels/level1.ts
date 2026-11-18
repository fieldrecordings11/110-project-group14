import { Level } from './types';

export const level1: Level = {
  id: 'FIRST STEPS',
  allowedBlocks: ['move_right', 'move_down'],
  blockLimit: 20,
  instructions: 'Move the robot to the goal using the move blocks.',
  map: {
    width: 4,
    height: 3,
    start: { x: 0, y: 0 },
    goal: { x: 3, y: 2 },
    walls: [],
  },
};