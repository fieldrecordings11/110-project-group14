import { GuessResult, HangmanQuestion, HangmanStatus, KeyState, LossReason, Slot } from './types';

/**
 * The 40 keys on the board: letters, digits and the symbols code needs.
 * 40 = 8 columns x 5 rows, which is the grid in the design (3 rows above the answer, 2 below).
 */
export const KEYS: string[] = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789();='.split('');

/** Wrong guesses a player may make before the round is lost. */
export const MAX_WRONG_GUESSES = 6;

/** Wrong guesses after which the question's hint is shown. */
export const HINT_AFTER_WRONG = 2;

/** Checks that a question can actually be played; returns the answer in upper case. */
export function normalizeAnswer(answer: string): string {
  const upper = answer.toUpperCase();
  let guessable = 0;
  for (const char of upper.split('')) {
    if (char === ' ') continue;
    if (KEYS.indexOf(char) === -1) {
      throw new Error(`Hangman answer "${answer}" uses "${char}", which is not on the board.`);
    }
    guessable += 1;
  }
  if (guessable === 0) throw new Error('Hangman answer needs at least one guessable character.');
  return upper;
}

/**
 * The rules of one Hangman round. No timers and no DOM in here: the view owns the clock
 * and calls timeUp() when it runs out, which keeps this class easy to test.
 */
export class HangmanGame {
  readonly answer: string;
  private readonly used = new Set<string>();
  private wrong = 0;
  private timedOut = false;

  constructor(
    readonly question: HangmanQuestion,
    readonly maxWrong: number = MAX_WRONG_GUESSES,
  ) {
    this.answer = normalizeAnswer(question.answer);
  }

  /** Press a key (letters are case-insensitive). */
  guess(key: string): GuessResult {
    if (this.status !== 'playing') return 'ignored';
    const char = key.toUpperCase();
    if (KEYS.indexOf(char) === -1) return 'invalid';
    if (this.used.has(char)) return 'repeat';

    this.used.add(char);
    if (this.answer.indexOf(char) !== -1) return 'correct';
    this.wrong += 1;
    return 'wrong';
  }

  /** The clock ran out. Does nothing if the round already ended. */
  timeUp(): void {
    if (this.status === 'playing') this.timedOut = true;
  }

  get status(): HangmanStatus {
    if (this.answer.split('').every((c) => c === ' ' || this.used.has(c))) return 'won';
    if (this.timedOut || this.wrong >= this.maxWrong) return 'lost';
    return 'playing';
  }

  /** Why the round was lost, or undefined if it was not lost. */
  get lossReason(): LossReason | undefined {
    if (this.status !== 'lost') return undefined;
    return this.wrong >= this.maxWrong ? 'out_of_lives' : 'time_up';
  }

  get wrongGuesses(): number {
    return this.wrong;
  }

  get livesLeft(): number {
    return Math.max(0, this.maxWrong - this.wrong);
  }

  /** True once enough wrong guesses have been made that the hint should be shown. */
  get hintUnlocked(): boolean {
    return this.wrong >= HINT_AFTER_WRONG;
  }

  /** The answer row, one entry per character. */
  get slots(): Slot[] {
    return this.answer.split('').map((char) => {
      const gap = char === ' ';
      return { char, gap, revealed: !gap && this.used.has(char) };
    });
  }

  keyState(key: string): KeyState {
    const char = key.toUpperCase();
    if (!this.used.has(char)) return 'unused';
    return this.answer.indexOf(char) !== -1 ? 'hit' : 'miss';
  }
}
