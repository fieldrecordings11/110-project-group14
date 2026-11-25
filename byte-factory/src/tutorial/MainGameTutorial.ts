import './tutorial.css';
import robotUrl from '../../assets/byte-robot-24.png';
import goalUrl from '../../assets/byte-goal-marker-24.png';
import { ArrowSide, MAIN_GAME_TUTORIAL_STEPS, TutorialStep } from './steps';

const storageKey = 'byteFactory.tutorial.mainGame.hidden';

/** How far (px) the arrow's centre sits from the highlighted part's edge. */
const ARROW_GAP = 30;
/** Extra room (px) around the highlighted part. */
const SPOTLIGHT_PADDING = 6;
/** Matches the overlay's fade-out time in tutorial.css. */
const CLOSE_MS = 200;

const ARROW_ROTATION: Record<ArrowSide, number> = {
  left: 0,
  top: 90,
  right: 180,
  bottom: -90,
};

const GRID_COLS = 5;
const GRID_ROWS = 3;
const WALLS = ['2,0', '2,2', '4,0'];

const gridCells = () => {
  let cells = '';
  for (let y = 0; y < GRID_ROWS; y++) {
    for (let x = 0; x < GRID_COLS; x++) {
      cells += `<span class="tut-cell${WALLS.includes(`${x},${y}`) ? ' wall' : ''}"></span>`;
    }
  }
  return cells;
};

/** A small, non-interactive copy of the level screen that the tutorial points at. */
const MOCK = `
  <div class="tut-mock" aria-hidden="true">
    <div class="tut-header">
      <div class="tut-header-row">
        <span class="tut-back" data-part="back">← Roadmap</span>
        <div class="tut-info" data-part="info">
          <b>Level 1: First Steps</b>
          <span class="tut-yellow">Move the robot to the goal.</span>
          <span class="tut-yellow"><b>Block limit: 3</b></span>
        </div>
      </div>
    </div>
    <div class="tut-body">
      <div class="tut-toolbox" data-part="toolbox">
        <span class="tut-cat" style="--cat:#405DE6">Movement</span>
        <span class="tut-cat" style="--cat:#a55b5b">Actions</span>
        <span class="tut-cat" style="--cat:#5ba55b">Sensing</span>
        <span class="tut-cat" style="--cat:#5b80a5">Logic</span>
        <span class="tut-cat" style="--cat:#5ba55b">Loops</span>
      </div>
      <div class="tut-workspace" data-part="workspace">
        <span class="tut-block tut-ws-block" style="--i:0">Move right</span>
        <span class="tut-block tut-ws-block" style="--i:1">Move right</span>
        <span class="tut-block tut-ws-block" style="--i:2">Move right</span>
      </div>
      <div class="tut-output">
        <div class="tut-grid" data-part="grid">
          <div class="tut-grid-inner">
            ${gridCells()}
            <img class="tut-goal" src="${goalUrl}" alt="" />
            <img class="tut-robot" src="${robotUrl}" alt="" />
          </div>
        </div>
        <div class="tut-controls">
          <span class="tut-btn tut-run" data-part="run">Run</span>
          <span class="tut-btn-pair" data-part="resets">
            <span class="tut-btn tut-reset">Reset Robot</span>
            <span class="tut-btn">Reset Blocks</span>
          </span>
          <span class="tut-btn-pair" data-part="saves">
            <span class="tut-btn">Export Save</span>
            <span class="tut-btn">Import Save</span>
          </span>
        </div>
        <div class="tut-code" data-part="code">
          <span class="tut-status">You reached the goal!</span>
          <code>moveRight();<br />moveRight();<br />moveRight();</code>
        </div>
      </div>
    </div>
  </div>`;

const TEMPLATE = `
  <div class="tutorial-panel">
    <div class="tutorial-topbar">
      <span class="tutorial-kicker">How to play</span>
      <button class="tutorial-skip" type="button">Skip tutorial ✕</button>
    </div>
    <div class="tutorial-stage">
      ${MOCK}
      <div class="tut-spotlight"></div>
      <div class="tut-arrow"><span class="tut-arrow-icon">➜</span></div>
    </div>
    <div class="tutorial-caption">
      <h2 id="tutorialTitle"></h2>
      <p class="tutorial-body"></p>
    </div>
    <div class="tutorial-nav">
      <button class="tutorial-prev" type="button" aria-label="Previous page">◀</button>
      <div class="tutorial-dots"></div>
      <button class="tutorial-next" type="button" aria-label="Next page">▶</button>
    </div>
    <label class="tutorial-hide">
      <input type="checkbox" class="tutorial-hide-input" />
      Don’t show this again
    </label>
  </div>`;

/** False once the player ticks "Don't show this again". Unreadable storage shows the tutorial. */
export function shouldShowMainGameTutorial(): boolean {
  try {
    return window.localStorage.getItem(storageKey) !== 'true';
  } catch {
    return true;
  }
}

function setTutorialHidden(hidden: boolean): void {
  try {
    if (hidden) window.localStorage.setItem(storageKey, 'true');
    else window.localStorage.removeItem(storageKey);
  } catch {
    // Storage unavailable: the tutorial just shows again next time.
  }
}

/**
 * Popup tour of the level screen. Each page highlights one part of a mock level screen
 * with a spotlight and an arrow; the arrows (or ← → keys) page through it and Skip / Esc
 * closes it.
 */
export class MainGameTutorial {
  private overlay: HTMLElement | null = null;
  private index = 0;
  private onClose: (() => void) | undefined;

  constructor(private readonly steps: TutorialStep[] = MAIN_GAME_TUTORIAL_STEPS) {}

  isOpen(): boolean {
    return this.overlay !== null;
  }

  currentPage(): number {
    return this.index;
  }

  open(onClose?: () => void): void {
    if (this.overlay) return;
    this.onClose = onClose;
    this.index = 0;

    const overlay = document.createElement('div');
    overlay.className = 'tutorial-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-labelledby', 'tutorialTitle');
    overlay.innerHTML = TEMPLATE;
    document.body.appendChild(overlay);
    this.overlay = overlay;

    const dots = this.find('.tutorial-dots');
    this.steps.forEach((step, i) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'tutorial-dot';
      dot.setAttribute('aria-label', `Go to page ${i + 1}: ${step.title}`);
      dot.addEventListener('click', () => this.goTo(i));
      dots.appendChild(dot);
    });

    this.find('.tutorial-prev').addEventListener('click', () => this.prev());
    this.find('.tutorial-next').addEventListener('click', () => this.next());
    this.find('.tutorial-skip').addEventListener('click', () => this.close());
    const hide = this.find<HTMLInputElement>('.tutorial-hide-input');
    hide.checked = !shouldShowMainGameTutorial();
    hide.addEventListener('change', () => setTutorialHidden(hide.checked));

    document.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('resize', this.onResize);

    this.render(0);
    this.find<HTMLButtonElement>('.tutorial-next').focus();
  }

  next(): void {
    if (this.index >= this.steps.length - 1) this.close();
    else this.goTo(this.index + 1);
  }

  prev(): void {
    if (this.index > 0) this.goTo(this.index - 1);
  }

  goTo(index: number): void {
    if (!this.overlay || index < 0 || index >= this.steps.length || index === this.index) return;
    const direction = index > this.index ? 1 : -1;
    this.index = index;
    this.render(direction);
  }

  /** Closes the tutorial (Skip, Esc, or finishing the last page). */
  close(): void {
    const overlay = this.overlay;
    if (!overlay) return;
    this.overlay = null;
    document.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('resize', this.onResize);
    overlay.classList.add('closing');
    window.setTimeout(() => overlay.remove(), CLOSE_MS);
    const onClose = this.onClose;
    this.onClose = undefined;
    onClose?.();
  }

  private readonly onKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'ArrowRight') this.next();
    else if (event.key === 'ArrowLeft') this.prev();
    else if (event.key === 'Escape') this.close();
    else return;
    event.preventDefault();
  };

  private readonly onResize = () => this.placePointer();

  private find<T extends HTMLElement = HTMLElement>(selector: string): T {
    return this.overlay!.querySelector(selector) as T;
  }

  /** direction: 1 forward, -1 back, 0 first page. Used to slide the caption in from that side. */
  private render(direction: number): void {
    const step = this.steps[this.index];
    const last = this.index === this.steps.length - 1;

    this.find('#tutorialTitle').textContent = step.title;
    this.find('.tutorial-body').textContent = step.body;

    const prev = this.find<HTMLButtonElement>('.tutorial-prev');
    const next = this.find<HTMLButtonElement>('.tutorial-next');
    prev.disabled = this.index === 0;
    next.textContent = last ? 'Let’s go!' : '▶';
    next.classList.toggle('finish', last);
    next.setAttribute('aria-label', last ? 'Finish tutorial' : 'Next page');

    this.overlay!.querySelectorAll('.tutorial-dot').forEach((dot, i) => {
      dot.classList.toggle('active', i === this.index);
      dot.classList.toggle('seen', i < this.index);
    });

    // Restart the caption's slide-in animation.
    const caption = this.find('.tutorial-caption');
    caption.classList.remove('enter-forward', 'enter-back');
    void caption.offsetWidth;
    caption.classList.add(direction < 0 ? 'enter-back' : 'enter-forward');

    // The mock plays a small animation for the part being explained (see tutorial.css).
    const mock = this.find('.tut-mock');
    if (step.target) mock.dataset.active = step.target;
    else delete mock.dataset.active;
    this.overlay!.querySelectorAll('[data-part]').forEach((part) => {
      part.classList.toggle('tut-focused', part.getAttribute('data-part') === step.target);
    });

    this.placePointer();
  }

  /** Moves the spotlight over the current target and parks the arrow beside it. */
  private placePointer(): void {
    if (!this.overlay) return;
    const step = this.steps[this.index];
    const stage = this.find('.tutorial-stage');
    const spotlight = this.find('.tut-spotlight');
    const arrow = this.find('.tut-arrow');
    const target = step.target ? this.overlay.querySelector(`[data-part="${step.target}"]`) : null;

    if (!target) {
      // Intro / outro pages: no spotlight, just the whole mock.
      const box = stage.getBoundingClientRect();
      spotlight.classList.add('idle');
      arrow.classList.add('hidden');
      Object.assign(spotlight.style, {
        left: '0px',
        top: '0px',
        width: `${box.width}px`,
        height: `${box.height}px`,
      });
      return;
    }

    const stageBox = stage.getBoundingClientRect();
    const box = target.getBoundingClientRect();
    // Keep the spotlight's border inside the stage so tall parts (the toolbox) aren't cut off.
    const inset = 3;
    const left = Math.max(inset, box.left - stageBox.left - SPOTLIGHT_PADDING);
    const top = Math.max(inset, box.top - stageBox.top - SPOTLIGHT_PADDING);
    const right = Math.min(stageBox.width - inset, box.right - stageBox.left + SPOTLIGHT_PADDING);
    const bottom = Math.min(stageBox.height - inset, box.bottom - stageBox.top + SPOTLIGHT_PADDING);
    const width = right - left;
    const height = bottom - top;

    spotlight.classList.remove('idle');
    Object.assign(spotlight.style, {
      left: `${left}px`,
      top: `${top}px`,
      width: `${width}px`,
      height: `${height}px`,
    });

    const side = step.arrow ?? 'bottom';
    const centerX = left + width / 2;
    const centerY = top + height / 2;
    const point = {
      left: { x: left - ARROW_GAP, y: centerY },
      right: { x: left + width + ARROW_GAP, y: centerY },
      top: { x: centerX, y: top - ARROW_GAP },
      bottom: { x: centerX, y: top + height + ARROW_GAP },
    }[side];

    arrow.classList.remove('hidden');
    arrow.style.left = `${point.x}px`;
    arrow.style.top = `${point.y}px`;
    arrow.style.setProperty('--rotation', `${ARROW_ROTATION[side]}deg`);
  }
}
