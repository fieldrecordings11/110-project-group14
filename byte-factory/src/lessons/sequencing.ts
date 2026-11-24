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
    {
      kind: 'text',
      heading: 'One step at a time',
      paragraphs: [
        'Every program starts with the "when RUN pressed" block. Snap blocks underneath it, ' +
          'and when you press Run, Byte follows them one at a time, from top to bottom. ' +
          'Running instructions in order like this is called SEQUENCING.',
        'Each move block sends Byte one tile up, down, left or right. ' +
          'If a wall is in the way, Byte bumps into it and the program stops.',
      ],
    },
    {
      kind: 'text',
      heading: 'Order matters',
      paragraphs: [
        '"Move right, then down" and "move down, then right" take Byte along different paths. ' +
          'Around walls, only one of them might get through. Swapping two blocks can change everything.',
        'Before you build, trace the path with your finger and count the tiles to each turn. ' +
          'Then press Run and watch. If Byte goes the wrong way, find the first block where it went wrong ' +
          'and fix that one. Finding and fixing mistakes is called DEBUGGING.',
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
