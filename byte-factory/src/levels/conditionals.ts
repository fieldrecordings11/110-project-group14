import { GridMap } from '../interpreter/types';
import { Level } from './types';

/**
 * Conditionals: a hallway with puddles at uneven gaps. Hard-coding the moves takes 7 blocks
 * and a plain loop can't follow the uneven pattern, so the player needs an if/else in a loop.
 * Solution: repeat until (Standing on finish) {
 *   if (Puddle to the right) { jump right } else { move right }
 * } (6 blocks).
 */
export const conditionalsLevel: Level = {
  id: 'conditionals',
  allowedBlocks: [
    'move_right',
    'jump_right',
    'puddle_right',
    'controls_if',
    'controls_whileUntil',
    'on_finish_grid',
  ],
  blockLimit: 6,
  instructions:
    'Puddles! The robot slips if it steps in one, so it has to jump over them. ' +
    'Use "if / else": if there is a puddle to the right, jump right, otherwise move right. ' +
    'Put it inside "repeat until" so the robot keeps checking until it reaches the star.',
};

export const conditionalsMap: GridMap = {
  width: 12,
  height: 1,
  start: { x: 0, y: 0 },
  goal: { x: 11, y: 0 },
  walls: [],
  puddles: [
    { x: 2, y: 0 },
    { x: 4, y: 0 },
    { x: 7, y: 0 },
    { x: 10, y: 0 },
  ],
};
