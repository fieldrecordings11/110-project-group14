import { loopsLevel } from '../levels/loops';
import { demoProgram } from './demoProgram';
import { Lesson } from './types';

export const loopsLesson: Lesson = {
  levelId: loopsLevel.id,
  subtitle: 'Again and Again',
  pages: [
    {
      kind: 'text',
      heading: 'Doing it again',
      paragraphs: [
        'Some jobs are the same few steps over and over. You could stack "move right, move down" ' +
          'ten times, but that is a lot of blocks, and one wrong block is hard to spot.',
        'A LOOP tells the computer to repeat a group of instructions. ' +
          'You write the steps once, and the loop runs them as many times as needed.',
      ],
    },
    {
      kind: 'text',
      heading: 'Repeat until',
      paragraphs: [
        'The "repeat until" block runs the blocks inside it again and again. ' +
          'Before each round it checks a CONDITION, a question that is either true or false. ' +
          'As soon as the answer is true, the loop stops.',
        'Snap "Standing on finish" into the loop\'s slot, ' +
          'and Byte keeps repeating until it reaches the star.',
      ],
    },
    {
      kind: 'text',
      heading: 'Find the pattern',
      paragraphs: [
        'To use a loop, look for the steps that repeat. Ask yourself: what is the smallest group of moves ' +
          'that gets Byte to the star if it is done again and again? Those moves go inside the loop.',
        'Careful: if the condition never becomes true, the loop would run forever. ' +
          'If Byte can never reach the star, the game stops the program for you, so check your pattern and try again.',
      ],
    },
    {
      kind: 'example',
      caption:
        '"Move right" is inside the loop only once, but it runs five times: ' +
        'the loop repeats it until Byte is standing on the finish.',
      demo: {
        map: { width: 6, height: 1, start: { x: 0, y: 0 }, goal: { x: 5, y: 0 }, walls: [] },
        blocks: demoProgram({
          type: 'controls_whileUntil',
          fields: { MODE: 'UNTIL' },
          inputs: {
            BOOL: { block: { type: 'on_finish_grid' } },
            DO: { block: { type: 'move_right' } },
          },
        }),
      },
    },
  ],
};
