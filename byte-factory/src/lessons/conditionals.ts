import { conditionalsLevel } from '../levels/conditionals';
import { demoProgram } from './demoProgram';
import { Lesson } from './types';

export const conditionalsLesson: Lesson = {
  levelId: conditionalsLevel.id,
  subtitle: 'Making Choices',
  pages: [
    {
      kind: 'text',
      heading: 'Making decisions',
      paragraphs: [
        'So far Byte has followed the same steps no matter what. ' +
          'Real programs often need to look around first, then choose what to do.',
        'A CONDITIONAL lets a program make a choice: IF something is true, do one thing. ' +
          'ELSE (otherwise), do something different.',
      ],
    },
    {
      kind: 'text',
      heading: 'Sensors and if / else',
      paragraphs: [
        'Byte checks its surroundings with sensor blocks, like "Puddle to the right". ' +
          'A sensor answers a question with true or false.',
        'Put a sensor in an "if / else" block. If the answer is true, Byte runs the blocks in the first slot. ' +
          'If it is false, Byte runs the blocks under "else" instead.',
      ],
    },
    {
      kind: 'text',
      heading: 'Watch your step',
      paragraphs: [
        'Puddles are slippery: if Byte steps in one, the program stops. ' +
          '"Jump right" leaps two tiles in one move, right over a puddle.',
        'The puddles in this hallway are not evenly spaced, so no fixed pattern of moves will work. ' +
          'Combine what you know: a loop that keeps going, with a choice inside it.',
      ],
    },
    {
      kind: 'example',
      caption:
        'Byte checks for a puddle first. There is one, so it runs the "do" part and jumps ' +
        'instead of the "else" part. Then it moves on to the star.',
      demo: {
        map: {
          width: 4,
          height: 1,
          start: { x: 0, y: 0 },
          goal: { x: 3, y: 0 },
          walls: [],
          puddles: [{ x: 1, y: 0 }],
        },
        blocks: demoProgram(
          {
            type: 'controls_if',
            extraState: { hasElse: true },
            inputs: {
              IF0: { block: { type: 'puddle_right' } },
              DO0: { block: { type: 'jump_right' } },
              ELSE: { block: { type: 'move_right' } },
            },
          },
          'move_right',
        ),
      },
    },
  ],
};
