import { HangmanQuestion } from './types';

/**
 * Hangman questions per level, keyed by Level.id (see levels/data.ts).
 * Answers may only use the keys on the board: A-Z, 0-9, ( ) ; = and spaces (shown as gaps).
 *
 * To add questions for a new level, add an entry here with that level's id.
 */
const byLevel = new Map<string, HangmanQuestion[]>([
  [
    'sequencing',
    [
      {
        id: 'demo-move-right',
        prompt: 'What line of code makes the robot move right?',
        snippet: '// 0 = up, 1 = down, 2 = right, 3 = left\n________',
        answer: 'move(2);',
        hint: 'A call to a function looks like name(number);',
      },
      {
        id: 'demo-move-up',
        prompt: 'What line of code makes the robot move up?',
        snippet: '// 0 = up, 1 = down, 2 = right, 3 = left\n________',
        answer: 'move(0);',
        hint: 'Look at which number means up in the list.',
      },
      {
        id: 'demo-repeat',
        prompt: 'Which block repeats the blocks inside it?',
        snippet: '______ 4 times\n  Move right',
        answer: 'repeat',
        hint: 'It is in the Loops drawer.',
      },
      {
        id: 'demo-loop',
        prompt: 'What do we call code that runs again and again?',
        answer: 'loop',
        hint: 'Four letters. The Repeat block makes one.',
      },
      {
        id: 'demo-algorithm',
        prompt: 'What is a step-by-step plan for solving a problem called?',
        answer: 'algorithm',
        hint: 'Your blocks are one!',
      },
      {
        id: 'demo-bug',
        prompt: 'What is a mistake in your code called?',
        answer: 'bug',
        hint: 'Three letters, and it also crawls.',
      },
    ],
  ],
]);

/** Used for levels that have no questions of their own yet. */
export const generalQuestions: HangmanQuestion[] = [
  {
    id: 'general-variable',
    prompt: 'What is a named box that stores a value called?',
    answer: 'variable',
    hint: 'Its value can vary.',
  },
  {
    id: 'general-function',
    prompt: 'What is a named group of blocks you can reuse called?',
    answer: 'function',
    hint: 'You call it by name.',
  },
  {
    id: 'general-if',
    prompt: 'Which block runs code only when something is true?',
    snippet: '__ (wall ahead) {\n  move(1);\n}',
    answer: 'if',
    hint: 'Two letters.',
  },
  {
    id: 'general-loop',
    prompt: 'What do we call code that runs again and again?',
    answer: 'loop',
    hint: 'Four letters.',
  },
];

/** The questions for a level, or the general ones when the level has none. */
export function questionsForLevel(levelId: string): HangmanQuestion[] {
  return byLevel.get(levelId) ?? generalQuestions;
}

/** Every question in the bank (handy for tests). */
export function allQuestions(): HangmanQuestion[] {
  const all = generalQuestions.slice();
  byLevel.forEach((questions) => all.push(...questions));
  return all;
}

/** A shuffled copy (Fisher-Yates). Pass `random` to make it predictable in tests. */
export function shuffle<T>(items: T[], random: () => number = Math.random): T[] {
  const copy = items.slice();
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    const tmp = copy[i];
    copy[i] = copy[j];
    copy[j] = tmp;
  }
  return copy;
}
