import { Level } from './types';

export const level2: Level = {
  id: 'LOOPS',
  title: 'Loops',
  allowedBlocks: ['move_right', 'move_down', 'controls_repeat_ext', 'math_number'],
  blockLimit: 20,
  instructions: `
# Understanding Loops in Coding

A loop is a programming concept that allows a computer to repeat a set of instructions multiple times without needing the programmer to write those instructions over and over.

Think of a loop like a teacher taking attendance. Instead of checking every student manually with a separate instruction, the teacher follows the same process for each student on the class list.

## Why Are Loops Important?

Loops help programmers:

- Save time by avoiding repetitive instructions.
- Reduce repeated code and make programs easier to maintain.
- Automate tasks such as processing lists, counting numbers, and checking information.

## Your Mission

Use loops to move the robot to the goal.
`,
  map: {
    width: 8,
    height: 3,
    start: { x: 0, y: 0 },
    goal: { x: 7, y: 0 },
    walls: [],
  },
};