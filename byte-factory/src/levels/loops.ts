import { GridMap, Position } from '../interpreter/types';
import { wallsExcept } from './grid';
import { Level } from './types';

/**
 * Loops: a staircase that needs 10 moves, but only 4 blocks are allowed,
 * so the player has to repeat "move right, move down" in a loop.
 * Solution: repeat until (Standing on finish) { move right; move down } (4 blocks).
 */
export const loopsLevel: Level = {
  id: 'loops',
  allowedBlocks: ['move_right', 'move_down', 'controls_whileUntil', 'on_finish_grid'],
  blockLimit: 4,
  instructions:
    'The robot has to climb down the stairs, but you only have 4 blocks. ' +
    'Put the moves that repeat inside "repeat until" with "Standing on finish", ' +
    'so the loop keeps going until the robot reaches the star.',
};

const STAIRS: Position[] = [
  { x: 0, y: 0 },
  { x: 1, y: 0 },
  { x: 1, y: 1 },
  { x: 2, y: 1 },
  { x: 2, y: 2 },
  { x: 3, y: 2 },
  { x: 3, y: 3 },
  { x: 4, y: 3 },
  { x: 4, y: 4 },
  { x: 5, y: 4 },
  { x: 5, y: 5 },
];

export const loopsMap: GridMap = {
  width: 6,
  height: 6,
  start: { x: 0, y: 0 },
  goal: { x: 5, y: 5 },
  walls: wallsExcept(6, 6, STAIRS),
};
