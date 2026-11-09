import { Level } from './types';
import { demoLevel } from './demo';

/*
 * Levels in play order. Each level looks like (see ./types.ts):
 * {
 *     id: 'first-loop',                   // unique, stable string id
 *     allowedBlocks: ['move_up', 'controls_repeat_ext'],  // block types the player may use
 *     blockLimit: 5,                      // max blocks, not counting 'start'
 *     instructions: 'Use a loop to ...',  // text shown to the player
 *     map: { width, height, start, goal, walls },  // starting grid, (0, 0) is the top-left tile
 *     startState: { ... },                // optional: serialized Blockly blocks to start with
 * }
 */
export const levels: Level[] = [
    demoLevel,
];
