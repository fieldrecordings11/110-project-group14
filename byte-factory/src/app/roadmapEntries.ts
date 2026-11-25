import { levelRegistry } from '../levels';
import { conditionalsLevel } from '../levels/conditionals';
import { loopsLevel } from '../levels/loops';
import { sequencingLevel } from '../levels/sequencing';
import { Level } from '../levels/types';
import { RoadmapLevel, getLevelStatus } from '../screens/roadmap';

/**
 * Each roadmap stop opens a Blockly level.
 * `id` is the stop's id (used for progress); `levelId` is the id of a level in levels/data.ts.
 */
export type RoadmapEntry = { kind: 'level'; id: string; levelId: string };

/**
 * Roadmap stops in play order. Each one unlocks when the one before it is completed.
 * Ids are saved in progress, so keep existing ids when reordering or adding stops.
 */
export const ROADMAP_ENTRIES: RoadmapEntry[] = [
  { kind: 'level', id: '1', levelId: sequencingLevel.id },
  { kind: 'level', id: '3', levelId: loopsLevel.id },
  { kind: 'level', id: '4', levelId: conditionalsLevel.id },
];

/** The level a roadmap stop opens. Throws if no level has that id, so a typo fails loudly. */
export function getEntryLevel(levelId: string): Level {
  const level = levelRegistry.get(levelId);
  if (!level) {
    throw new Error(`Unknown level id: ${levelId}`);
  }
  return level;
}

const TOP_Y = 90;
const SPACING_Y = 130;

/** Turns entries into what showRoadmap draws: status from progress, first stop at the bottom. */
export function toRoadmapLevels(entries: RoadmapEntry[], completedIds: readonly string[]): RoadmapLevel[] {
  const levels: RoadmapLevel[] = entries.map((entry, index) => ({
    id: entry.id,
    title: getEntryLevel(entry.levelId).title,
    status: 'locked',
    y: TOP_Y + (entries.length - 1 - index) * SPACING_Y,
  }));
  return levels.map((level, index) => ({
    ...level,
    status: getLevelStatus(level.id, index, levels, completedIds),
  }));
}
