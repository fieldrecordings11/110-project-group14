import { GridMap } from '../interpreter/types';
import { demoLevel, demoMap } from '../levels/demo';
import { Level } from '../levels/types';
import { RoadmapLevel, getLevelStatus } from '../screens/roadmap';

/** What a roadmap stop opens: a Blockly level or the Hangman minigame. */
export type RoadmapEntry =
  | { kind: 'level'; id: string; title: string; level: Level; map: GridMap }
  | { kind: 'hangman'; id: string; title: string; questionsFor: string };

/** Roadmap stops in play order. Each one unlocks when the one before it is completed. */
export const ROADMAP_ENTRIES: RoadmapEntry[] = [
  { kind: 'level', id: '1', title: 'Demo level', level: demoLevel, map: demoMap },
  { kind: 'hangman', id: '2', title: 'Hangman', questionsFor: demoLevel.id },
];

const TOP_Y = 90;
const SPACING_Y = 130;

/** Turns entries into what showRoadmap draws: status from progress, first stop at the bottom. */
export function toRoadmapLevels(entries: RoadmapEntry[], completedIds: readonly string[]): RoadmapLevel[] {
  const levels: RoadmapLevel[] = entries.map((entry, index) => ({
    id: entry.id,
    title: entry.title,
    status: 'locked',
    y: TOP_Y + (entries.length - 1 - index) * SPACING_Y,
  }));
  return levels.map((level, index) => ({
    ...level,
    status: getLevelStatus(level.id, index, levels, completedIds),
  }));
}
