import { GridMap } from '../interpreter/types';

/** A small, self-contained program shown on an example page, with its own tiny grid. */
export type LessonDemo = {
  map: GridMap;
  /** Serialized Blockly workspace (same format as Level.startState). Shown read-only. */
  blocks: object;
};

/** One card of the lesson. The preview screen shows one page at a time. */
export type LessonPage =
  | { kind: 'text'; heading: string; paragraphs: string[] }
  | { kind: 'example'; caption: string; demo: LessonDemo };

/** The lesson shown before a level starts. */
export type Lesson = {
  levelId: string;   // matches Level.id
  subtitle: string;  // shown under the level title, e.g. "First Steps"
  pages: LessonPage[];
};
