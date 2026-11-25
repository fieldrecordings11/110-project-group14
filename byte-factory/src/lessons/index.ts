import { conditionalsLesson } from './conditionals';
import { loopsLesson } from './loops';
import { sequencingLesson } from './sequencing';
import { Lesson } from './types';

const lessons: Lesson[] = [sequencingLesson, loopsLesson, conditionalsLesson];

/** The lesson for a level, or undefined if that level has none (then skip straight to the level). */
export function getLesson(levelId: string): Lesson | undefined {
  for (const lesson of lessons) {
    if (lesson.levelId === levelId) {
      return lesson
    }
  }
  return undefined;
}
