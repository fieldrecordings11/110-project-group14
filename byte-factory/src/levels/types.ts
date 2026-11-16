import { GridMap } from '../interpreter/types';

export type Level = {
  id: string;
  allowedBlocks: string[];   // block types, e.g. "move_up", "controls_repeat_ext"
  blockLimit: number;        // max blocks the player may use
  instructions: string;
  map: GridMap;              // starting grid: size, robot start, goal and walls
  startState?: object;
};
