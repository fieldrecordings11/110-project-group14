import './hangman.css';
import { HangmanGame, KEYS } from './game';
import { questionsForLevel, shuffle } from './questions';
import { createRobotSvg } from './robot';
import { HangmanQuestion } from './types';

export type HangmanOptions = {
  /** Time allowed for each question. */
  timeLimitMs?: number;
  /** How many questions one session asks at most. */
  rounds?: number;
  /** Random source for shuffling the questions (pass a fixed one in tests). */
  random?: () => number;
};

/** Passed to open()'s onClose callback. finished is true when the player reached the score screen. */
export type HangmanResult = {
  finished: boolean;
  solved: number;
  total: number;
};

const DEFAULT_TIME_LIMIT_MS = 60_000;
const DEFAULT_ROUNDS = 5;
const TICK_MS = 100;

const CLOCK_ICON =
  '<svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">' +
  '<circle cx="9" cy="9" r="7.5"/><path d="M9 4.5V9l3 2"/></svg>';

function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className?: string,
  text?: string,
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

/** Rows of random 0s and 1s for the background. Purely decorative. */
function makeMatrixText(rows = 40, cols = 110): string {
  const lines: string[] = [];
  for (let y = 0; y < rows; y++) {
    let line = '';
    for (let x = 0; x < cols; x++) {
      line += Math.random() < 0.22 ? ' ' : Math.random() < 0.5 ? '0' : '1';
    }
    lines.push(line);
  }
  return lines.join('\n');
}

/** The elements we need to update while playing. */
type Ui = {
  overlay: HTMLDivElement;
  card: HTMLDivElement;
  title: HTMLHeadingElement;
  snippet: HTMLPreElement;
  play: HTMLDivElement;
  keyButtons: Map<string, HTMLButtonElement>;
  answer: HTMLDivElement;
  summary: HTMLDivElement;
  summaryScore: HTMLElement;
  robot: HTMLDivElement;
  pips: HTMLElement[];
  round: HTMLElement;
  message: HTMLParagraphElement;
  hint: HTMLParagraphElement;
  next: HTMLButtonElement;
  timerFill: HTMLDivElement;
};

/**
 * The optional Hangman minigame. open(levelId) shows it on top of the page with that
 * level's programming questions; close() (or Escape) takes it away again.
 *
 * Layout, top to bottom: the question, three rows of keys, the answer boxes, two rows of keys,
 * and a timer bar. The robot and the remaining lives sit on the right.
 */
export class HangmanMinigame {
  private ui: Ui | null = null;
  private opener: Element | null = null;
  private onClose: ((result: HangmanResult) => void) | undefined;

  private questions: HangmanQuestion[] = [];
  private index = 0;
  private solved = 0;
  private game: HangmanGame | null = null;
  private roundOver = false;
  private finished = false;

  private timerId: number | undefined;
  private deadline = 0;

  private readonly timeLimitMs: number;
  private readonly rounds: number;
  private readonly random: () => number;

  constructor(options: HangmanOptions = {}) {
    this.timeLimitMs = options.timeLimitMs ?? DEFAULT_TIME_LIMIT_MS;
    this.rounds = options.rounds ?? DEFAULT_ROUNDS;
    this.random = options.random ?? Math.random;
  }

  get isOpen(): boolean {
    return this.ui !== null;
  }

  /**
   * Starts a session with the questions for this level. Does nothing if already open.
   * onClose runs once when the minigame closes, however it was closed.
   */
  open(levelId: string, onClose?: (result: HangmanResult) => void): void {
    if (this.ui) return;
    this.onClose = onClose;
    this.opener = document.activeElement;
    this.questions = shuffle(questionsForLevel(levelId), this.random).slice(0, this.rounds);
    this.index = 0;
    this.solved = 0;
    this.finished = false;

    this.ui = this.buildUi();
    document.body.appendChild(this.ui.overlay);
    document.addEventListener('keydown', this.onKeyDown, true);
    this.ui.card.focus();
    this.startRound();
  }

  close(): void {
    if (!this.ui) return;
    this.stopTimer();
    document.removeEventListener('keydown', this.onKeyDown, true);
    this.ui.overlay.remove();
    this.ui = null;
    this.game = null;
    if (this.opener instanceof HTMLElement) this.opener.focus();
    this.opener = null;

    const onClose = this.onClose;
    this.onClose = undefined;
    onClose?.({ finished: this.finished, solved: this.solved, total: this.questions.length });
  }

  // ---------------------------------------------------------------- building the page

  private buildUi(): Ui {
    const overlay = el('div', 'hm-overlay');
    const card = el('div', 'hm-card');
    card.tabIndex = -1;
    card.setAttribute('role', 'dialog');
    card.setAttribute('aria-modal', 'true');
    card.setAttribute('aria-label', 'Hangman minigame');

    const matrix = el('pre', 'hm-matrix', makeMatrixText());
    matrix.setAttribute('aria-hidden', 'true');

    const content = el('div', 'hm-content');

    const close = el('button', 'hm-close', '✕');
    close.type = 'button';
    close.setAttribute('aria-label', 'Close Hangman');
    close.addEventListener('click', () => this.close());

    const title = el('h2', 'hm-title');
    const snippet = el('pre', 'hm-snippet');

    // Left column: keys / answer / keys, or the final score instead.
    const main = el('div', 'hm-main');
    const play = el('div', 'hm-play');
    const keysTop = el('div', 'hm-keys');
    const keysBottom = el('div', 'hm-keys');
    const answer = el('div', 'hm-answer');
    answer.setAttribute('aria-label', 'Answer');

    const keyButtons = new Map<string, HTMLButtonElement>();
    KEYS.forEach((key, i) => {
      const button = el('button', 'hm-key', key);
      button.type = 'button';
      button.setAttribute('aria-label', `Guess ${key}`);
      button.addEventListener('click', () => this.press(key));
      keyButtons.set(key, button);
      (i < 24 ? keysTop : keysBottom).appendChild(button);
    });
    play.append(keysTop, answer, keysBottom);

    const summary = el('div', 'hm-summary');
    summary.hidden = true;
    const summaryScore = el('strong', 'hm-summary-score');
    summary.append(summaryScore, el('span', 'hm-summary-label', 'questions solved'));

    // Right column: robot, lives, round counter.
    const side = el('div', 'hm-side');
    const robot = el('div', 'hm-robot');
    robot.appendChild(createRobotSvg());
    const lives = el('div', 'hm-lives');
    lives.setAttribute('aria-hidden', 'true');
    const pips: HTMLElement[] = [];
    for (let i = 0; i < 6; i++) {
      const pip = el('span', 'hm-pip');
      pips.push(pip);
      lives.appendChild(pip);
    }
    const round = el('div', 'hm-round');
    side.append(robot, lives, round);
    main.append(play, summary, side);

    // Messages ("Correct!", the hint, the Next button).
    const status = el('div', 'hm-status');
    const message = el('p', 'hm-message');
    message.setAttribute('role', 'status');
    message.setAttribute('aria-live', 'polite');
    const hint = el('p', 'hm-hint');
    const next = el('button', 'hm-next');
    next.type = 'button';
    next.hidden = true;
    next.addEventListener('click', () => (this.finished ? this.close() : this.advance()));
    status.append(message, hint, next);

    // Timer bar.
    const footer = el('div', 'hm-footer');
    const clock = el('span', 'hm-clock');
    clock.innerHTML = CLOCK_ICON;
    const timer = el('div', 'hm-timer');
    timer.setAttribute('role', 'img');
    timer.setAttribute('aria-label', 'Time left');
    const timerFill = el('div', 'hm-timer-fill');
    timer.appendChild(timerFill);
    footer.append(clock, el('span', 'hm-footer-label', 'TIMER'), timer);

    content.append(close, title, snippet, main, status, footer);
    card.append(matrix, content);
    overlay.appendChild(card);

    return {
      overlay, card, title, snippet, play, keyButtons, answer, summary, summaryScore,
      robot, pips, round, message, hint, next, timerFill,
    };
  }

  // ---------------------------------------------------------------- rounds

  private startRound(): void {
    const ui = this.ui;
    if (!ui) return;
    const question = this.questions[this.index];
    this.game = new HangmanGame(question);
    this.roundOver = false;

    ui.title.textContent = question.prompt;
    ui.snippet.textContent = question.snippet ?? '';
    ui.snippet.hidden = !question.snippet;
    ui.round.textContent = `${this.index + 1}/${this.questions.length}`;
    ui.message.textContent = '';
    ui.message.className = 'hm-message';
    ui.hint.textContent = '';
    ui.next.hidden = true;
    ui.robot.className = 'hm-robot';
    ui.answer.classList.remove('hm-answer--won');

    ui.keyButtons.forEach((button) => {
      button.disabled = false;
      button.className = 'hm-key';
    });
    this.renderLives();
    this.renderAnswer();
    this.startTimer();
  }

  private advance(): void {
    this.index += 1;
    if (this.index >= this.questions.length) this.showSummary();
    else this.startRound();
  }

  /** The player pressed a key (on screen or on the keyboard). */
  private press(key: string): void {
    const ui = this.ui;
    const game = this.game;
    if (!ui || !game || this.roundOver) return;

    const result = game.guess(key);
    if (result !== 'correct' && result !== 'wrong') return;

    const button = ui.keyButtons.get(key.toUpperCase());
    if (button) {
      button.disabled = true;
      button.classList.add(result === 'correct' ? 'hm-key--hit' : 'hm-key--miss');
    }
    this.renderAnswer();
    this.renderLives();

    if (result === 'wrong') this.playRobotAnimation('hm-robot--shake');
    if (game.hintUnlocked && game.question.hint && game.status === 'playing') {
      ui.hint.textContent = `Hint: ${game.question.hint}`;
    }
    if (game.status !== 'playing') this.endRound();
  }

  private endRound(): void {
    const ui = this.ui;
    const game = this.game;
    if (!ui || !game || this.roundOver) return;
    this.roundOver = true;
    this.stopTimer();
    ui.keyButtons.forEach((button) => (button.disabled = true));
    this.renderAnswer();
    ui.hint.textContent = '';

    if (game.status === 'won') {
      this.solved += 1;
      ui.message.textContent = 'Correct! Nice work.';
      ui.message.className = 'hm-message hm-message--won';
      ui.answer.classList.add('hm-answer--won');
      this.playRobotAnimation('hm-robot--happy');
    } else {
      const reason = game.lossReason === 'time_up' ? "Time's up!" : 'Out of power!';
      ui.message.textContent = `${reason} The answer was ${game.answer}`;
      ui.message.className = 'hm-message hm-message--lost';
      ui.robot.className = 'hm-robot hm-robot--sad';
    }

    const last = this.index >= this.questions.length - 1;
    ui.next.textContent = last ? 'Finish' : 'Next question';
    ui.next.hidden = false;
    ui.next.focus();
  }

  private showSummary(): void {
    const ui = this.ui;
    if (!ui) return;
    this.finished = true;
    this.game = null;
    ui.title.textContent = 'Hangman complete!';
    ui.snippet.hidden = true;
    ui.play.hidden = true;
    ui.summary.hidden = false;
    ui.summaryScore.textContent = `${this.solved} / ${this.questions.length}`;
    ui.message.textContent = '';
    ui.message.className = 'hm-message';
    ui.hint.textContent = '';
    ui.round.textContent = '';
    ui.robot.className = this.solved > 0 ? 'hm-robot hm-robot--happy' : 'hm-robot';
    ui.timerFill.style.transform = 'scaleX(0)';
    ui.next.textContent = 'Close';
    ui.next.hidden = false;
    ui.next.focus();
  }

  // ---------------------------------------------------------------- drawing

  private renderAnswer(): void {
    const ui = this.ui;
    const game = this.game;
    if (!ui || !game) return;
    const lost = game.status === 'lost';
    const slots = game.slots;

    ui.answer.style.setProperty('--slots', String(Math.max(8, slots.length)));
    ui.answer.textContent = '';
    slots.forEach((slot) => {
      const box = el('div', 'hm-slot');
      if (slot.gap) {
        box.classList.add('hm-slot--gap');
      } else if (slot.revealed) {
        box.textContent = slot.char;
      } else if (lost) {
        // Show what the player missed.
        box.textContent = slot.char;
        box.classList.add('hm-slot--missed');
      }
      ui.answer.appendChild(box);
    });
    ui.answer.setAttribute(
      'aria-label',
      'Answer: ' + slots.map((s) => (s.gap ? 'space' : s.revealed || lost ? s.char : 'blank')).join(' '),
    );
  }

  private renderLives(): void {
    const ui = this.ui;
    const game = this.game;
    if (!ui || !game) return;
    ui.pips.forEach((pip, i) => {
      pip.className = i < game.livesLeft ? 'hm-pip' : 'hm-pip hm-pip--off';
      pip.style.display = i < game.maxWrong ? '' : 'none';
    });
  }

  /** Restarts a one-off CSS animation on the robot. */
  private playRobotAnimation(className: string): void {
    const robot = this.ui?.robot;
    if (!robot) return;
    robot.classList.remove('hm-robot--shake', 'hm-robot--happy');
    void robot.offsetWidth; // forces a reflow so the animation can run again
    robot.classList.add(className);
  }

  // ---------------------------------------------------------------- timer

  private startTimer(): void {
    this.stopTimer();
    this.deadline = Date.now() + this.timeLimitMs;
    this.tick();
    this.timerId = window.setInterval(() => this.tick(), TICK_MS);
  }

  private stopTimer(): void {
    if (this.timerId !== undefined) {
      window.clearInterval(this.timerId);
      this.timerId = undefined;
    }
  }

  private tick(): void {
    const ui = this.ui;
    if (!ui || !this.game) return;
    const remaining = Math.max(0, this.deadline - Date.now());
    const ratio = remaining / this.timeLimitMs;
    ui.timerFill.style.transform = `scaleX(${ratio})`;
    ui.timerFill.classList.toggle('hm-timer-fill--low', ratio < 0.25);

    if (remaining === 0) {
      this.game.timeUp();
      this.endRound();
    }
  }

  // ---------------------------------------------------------------- keyboard

  /**
   * Registered while the minigame is open, in the capture phase, so typing a letter
   * guesses it instead of reaching Blockly's own keyboard shortcuts behind the overlay.
   */
  private readonly onKeyDown = (event: KeyboardEvent): void => {
    const ui = this.ui;
    if (!ui) return;

    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      this.close();
      return;
    }

    if (event.key === 'Tab') {
      this.keepFocusInside(event);
      return;
    }

    if (event.ctrlKey || event.metaKey || event.altKey || event.key.length !== 1) return;

    const key = event.key.toUpperCase();
    if (KEYS.indexOf(key) === -1) return;
    event.preventDefault();
    event.stopPropagation();
    this.press(key);
  };

  /** Tab / Shift+Tab cycle through the minigame's own buttons only. */
  private keepFocusInside(event: KeyboardEvent): void {
    const ui = this.ui;
    if (!ui) return;
    const focusable = Array.from(ui.card.querySelectorAll<HTMLButtonElement>('button')).filter(
      (b) => !b.disabled && !b.hidden && !b.closest('[hidden]'),
    );
    if (focusable.length === 0) {
      event.preventDefault();
      ui.card.focus();
      return;
    }
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = document.activeElement;
    if (!ui.card.contains(active) || (event.shiftKey && (active === first || active === ui.card))) {
      event.preventDefault();
      (event.shiftKey ? last : first).focus();
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  }
}
