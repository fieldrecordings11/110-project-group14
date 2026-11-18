import { GridMap } from '../interpreter/types';
import { Level } from './types';
import { demoLevel, demoMap } from './demo';

/** A playable level on the roadmap: the rules, the grid and a title for the map. */
export type CampaignLevel = {
  level: Level;
  title: string;
  map: GridMap;
};

const MOVES = ['move_up', 'move_down', 'move_left', 'move_right'];

const repeatMap: GridMap = {
  width: 8,
  height: 3,
  start: { x: 0, y: 1 },
  goal: { x: 7, y: 1 },
  walls: [
    { x: 3, y: 0 },
    { x: 5, y: 2 },
  ],
};

const repeatLevel: Level = {
  id: 'repeat',
  allowedBlocks: [...MOVES, 'controls_repeat_ext', 'math_number'],
  // Seven steps to the goal: too many blocks to place one by one, so a loop is needed.
  blockLimit: 6,
  instructions: 'Use a repeat block to cross the long corridor.',
  map: repeatMap,
};

const mazeMap: GridMap = {
  width: 7,
  height: 5,
  start: { x: 0, y: 0 },
  goal: { x: 6, y: 4 },
  walls: [
    { x: 1, y: 1 },
    { x: 1, y: 2 },
    { x: 1, y: 3 },
    { x: 3, y: 1 },
    { x: 3, y: 2 },
    { x: 3, y: 3 },
  ],
};

const mazeLevel: Level = {
  id: 'maze',
  allowedBlocks: [...MOVES, 'controls_repeat_ext', 'math_number'],
  blockLimit: 12,
  instructions: 'Find a way around the walls.',
  map: mazeMap,
};

/** Levels in roadmap order (first = bottom of the map). */
export const campaign: CampaignLevel[] = [
  { level: demoLevel, title: 'First steps', map: demoMap },
  { level: repeatLevel, title: 'Repeat actions', map: repeatMap },
  { level: mazeLevel, title: 'Around the walls', map: mazeMap },
];

export function findCampaignLevel(id: string): CampaignLevel | undefined {
  return campaign.find((entry) => entry.level.id === id);
}

