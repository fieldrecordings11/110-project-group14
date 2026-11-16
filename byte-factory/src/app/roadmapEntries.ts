import { levelRegistry } from '../levels';
import { demoLevel } from '../levels/demo';
import { Level } from '../levels/types';
import { RoadmapLevel, getLevelStatus } from '../screens/roadmap';

/**
 * What a roadmap stop opens: a Blockly level or the Hangman minigame.
 * `id` is the stop's id (used for progress); `levelId` is the id of a level in levels/data.ts.
 */
export type RoadmapEntry =
  | { kind: 'level'; id: string; levelId: string }
  | { kind: 'hangman'; id: string; title: string; questionsFor: string };

/** Roadmap stops in play order. Each one unlocks when the one before it is completed. */
export const ROADMAP_ENTRIES: RoadmapEntry[] = [
  { kind: 'level', id: '1', levelId: demoLevel.id },
  { kind: 'hangman', id: '2', title: 'Hangman', questionsFor: demoLevel.id },
];

/** The level a roadmap stop opens. Throws if no level has that id, so a typo fails loudly. */
export function getEntryLevel(levelId: string): Level {
  const level = levelRegistry.get(levelId);
  if (!level) {
    throw new Error(`Unknown level id: ${levelId}`);
  }
  return level;
}

/** A level stop shows its level's title; Hangman stops have their own. */
function entryTitle(entry: RoadmapEntry): string {
  return entry.kind === 'level' ? getEntryLevel(entry.levelId).title : entry.title;
}

const TOP_Y = 90;
const SPACING_Y = 130;

/** Turns entries into what showRoadmap draws: status from progress, first stop at the bottom. */
export function toRoadmapLevels(entries: RoadmapEntry[], completedIds: readonly string[]): RoadmapLevel[] {
  const levels: RoadmapLevel[] = entries.map((entry, index) => ({
    id: entry.id,
    title: entryTitle(entry),
    status: 'locked',
    y: TOP_Y + (entries.length - 1 - index) * SPACING_Y,
  }));
  return levels.map((level, index) => ({
    ...level,
    status: getLevelStatus(level.id, index, levels, completedIds),
  }));
}
