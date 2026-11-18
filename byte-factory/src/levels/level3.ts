import { Level } from './types';

export const level3: Level = {
  id: 'CONDITIONALS',
  title: 'Conditionals',
  allowedBlocks: [
    'move_up', 'move_down', 'move_left', 'move_right',
    'controls_repeat_ext', 'math_number',
  ],
  blockLimit: 20,
  instructions: `
# Understanding Conditionals in Coding

Conditionals are a programming concept that allows a computer to make decisions based on whether a certain condition is true or false.

Think of conditionals like a teacher deciding whether a student has passed a test. If the student earns a passing score, they pass. Otherwise, they do not.

## Why Are Conditionals Important?

Conditionals help programmers:

- Make decisions based on information.
- Control program behavior by choosing which actions happen.
- Respond to different situations and user input.
- Create interactive programs, such as games, websites, and applications.

## Your Mission

Use conditionals to move the robot to the goal.
`,
  map: {
    width: 6,
    height: 5,
    start: { x: 0, y: 0 },
    goal: { x: 5, y: 4 },
    walls: [
      { x: 2, y: 0 },
      { x: 2, y: 1 },
      { x: 3, y: 3 },
    ],
  },
};