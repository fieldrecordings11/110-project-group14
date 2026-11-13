import { GridMap } from '../interpreter/types';
import { Level } from './types';

/**
 * Sequencing: blocks run one after another, top to bottom.
 * Solution: down, down, right, right, right, down, right (7 blocks).
 */
export const sequencingLevel: Level = {
  id: 'sequencing',
  allowedBlocks: ['move_up', 'move_down', 'move_left', 'move_right'],
  blockLimit: 10,
  instructions:
    'Blocks run in order, from top to bottom. Stack move blocks to guide the robot around the walls to the star.',
};

export const sequencingMap: GridMap = {
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
