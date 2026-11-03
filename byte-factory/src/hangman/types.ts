// Shared types for the optional Hangman minigame.

/** One round of Hangman: a programming question whose answer the player spells out. */
export type HangmanQuestion = {
  id: string;
  /** The question, shown as the big title (e.g. "What line of code goes here?"). */
  prompt: string;
  /**
   * What the player has to spell. Only characters that exist on the on-screen keys
   * (see KEYS in game.ts) are allowed, plus spaces, which are shown as gaps.
   */
  answer: string;
  // Optional code shown under the title, e.g. "// 0 = up, 1 = down, 2 = right, 3 = left". */
  snippet?: string;
  // Optional extra help, revealed after a couple of wrong guesses.
  hint?: string;
};

export type HangmanStatus = 'playing' | 'won' | 'lost';

/** Why a round was lost. */
export type LossReason = 'out_of_lives' | 'time_up';

/**
 * What happened when the player pressed a key:
 * correct / wrong - the key was new and is (not) in the answer;
 * repeat          - the key was already used, nothing changes;
 * invalid         - not one of the keys on the board;
 * ignored         - the round is already over.
 */
export type GuessResult = 'correct' | 'wrong' | 'repeat' | 'invalid' | 'ignored';

/** One box of the answer row. */
export type Slot = {
  char: string;
  /** True once the player has guessed this character (always false for gaps). */
  revealed: boolean;
  /** A space in the answer: drawn as an empty gap, never guessed. */
  gap: boolean;
};

export type KeyState = 'unused' | 'hit' | 'miss';
