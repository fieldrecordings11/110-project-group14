import { sequencingLevel } from '../levels/sequencing';
import { Lesson } from './types';

export const sequencingLesson: Lesson = {
  levelId: sequencingLevel.id,
  subtitle: 'First Steps',
  pages: [
    {
      kind: 'text',
      heading: 'What is a program?',
      paragraphs: [
        'A program is a list of instructions for a computer. Computers are fast, but not clever: ' +
          'they do exactly what you say, in exactly the order you say it.',
        'A step-by-step plan for solving a problem is called an ALGORITHM. ' +
          'Today your algorithm will steer Byte, the factory helper robot.',
      ],
    },
    // TODO: example page. Keep the demo grid small (e.g. 3x3) and only use blocks
    // this level allows (move_up/down/left/right), so the demo matches what the player gets.
    // {
    //   kind: 'example',
    //   caption: 'Blocks run from top to bottom. Order matters!',
    //   demo: { map: { ... }, blocks: { ... } },
    // },
  ],
};
