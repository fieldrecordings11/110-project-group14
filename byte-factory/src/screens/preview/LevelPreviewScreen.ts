import type { Screen } from '../../app/Screen';
import { Lesson, LessonPage } from '../../lessons/types';
import { Level } from '../../levels/types';
import { LessonDemo } from './LessonDemo';
import robotUrl from '../../../assets/byte-robot-24.png';
import './preview.css';

export type LevelPreviewScreenOptions = {
  level: Level;
  /** Shown in the title, e.g. "Level 1: Sequencing". */
  levelNumber: number;
  lesson: Lesson;
  /** Start Level / Skip to Level. */
  onStart: () => void;
  onBack: () => void;
};

const TEMPLATE = `
  <div class="preview-screen">
    <header class="preview-header">
      <button id="previewBack" class="preview-button" type="button">Back</button>
      <h1 id="previewTitle"></h1>
      <p id="previewSubtitle"></p>
    </header>

    <section class="preview-card">
      <div id="previewPage" class="preview-page"></div>
      <img class="preview-mascot" alt="" />
    </section>

    <footer class="preview-footer">
      <button id="previewSkip" class="preview-button skip" type="button">Skip to Level</button>
      <span id="previewPageCount"></span>
      <div class="preview-nav">
        <button id="previewPrev" class="preview-button" type="button">Prev</button>
        <button id="previewNext" class="preview-button next" type="button"></button>
      </div>
    </footer>
  </div>`;

const EXAMPLE_TEMPLATE = `
  <h2 class="preview-example-label">Example</h2>
  <p class="preview-example-caption"></p>
  <div class="preview-example-body">
    <div class="preview-example-blocks"></div>
    <div class="preview-example-side">
      <div class="preview-example-grid"></div>
      <button class="preview-button run" type="button">Run Demo</button>
    </div>
  </div>`;

/** Lesson pages shown before a level: read the lesson, watch a demo, then start the level. */
export class LevelPreviewScreen implements Screen {
  private pageIndex = 0;
  private demo: LessonDemo | null = null;
  private pageEl: HTMLElement | null = null;
  private pageCountEl: HTMLElement | null = null;
  private prevButton: HTMLButtonElement | null = null;
  private nextButton: HTMLButtonElement | null = null;

  constructor(private readonly options: LevelPreviewScreenOptions) {}

  mount(root: HTMLElement): void {
    const { level, levelNumber, lesson, onStart, onBack } = this.options;
    root.innerHTML = TEMPLATE;
    const find = <T extends HTMLElement>(id: string) => root.querySelector(`#${id}`) as T;

    find<HTMLElement>('previewTitle').textContent = `Level ${levelNumber}: ${level.title}`;
    find<HTMLElement>('previewSubtitle').textContent = lesson.subtitle;
    (root.querySelector('.preview-mascot') as HTMLImageElement).src = robotUrl;

    this.pageEl = find<HTMLElement>('previewPage');
    this.pageCountEl = find<HTMLElement>('previewPageCount');
    this.prevButton = find<HTMLButtonElement>('previewPrev');
    this.nextButton = find<HTMLButtonElement>('previewNext');

    find<HTMLButtonElement>('previewBack').addEventListener('click', onBack);
    find<HTMLButtonElement>('previewSkip').addEventListener('click', onStart);
    this.prevButton.addEventListener('click', () => this.goTo(this.pageIndex - 1));
    // On the last page, Next is the Start Level button.
    this.nextButton.addEventListener('click', () => {
      if (this.isLastPage()) onStart();
      else this.goTo(this.pageIndex + 1);
    });

    this.renderPage();
  }

  unmount(): void {
    this.demo?.destroy();
    this.demo = null;
  }

  private isLastPage(): boolean {
    return this.pageIndex === this.options.lesson.pages.length - 1;
  }

  private goTo(index: number): void {
    const lastIndex = this.options.lesson.pages.length - 1;
    this.pageIndex = Math.max(0, Math.min(index, lastIndex));
    this.renderPage();
  }

  /** Draw the current page and update the footer. */
  private renderPage(): void {
    const { pageEl, pageCountEl, prevButton, nextButton } = this;
    if (!pageEl || !pageCountEl || !prevButton || !nextButton) return;
    const { pages } = this.options.lesson;
    const page = pages[this.pageIndex];

    this.demo?.destroy();
    this.demo = null;
    pageEl.replaceChildren();
    pageEl.scrollTop = 0;
    if (page.kind === 'text') {
      this.renderText(pageEl, page);
    } else {
      this.renderExample(pageEl, page);
    }

    pageCountEl.textContent = `${this.pageIndex + 1} / ${pages.length}`;
    prevButton.disabled = this.pageIndex === 0;
    nextButton.textContent = this.isLastPage() ? 'Start Level' : 'Next';
    nextButton.classList.toggle('start', this.isLastPage());
  }

  private renderText(pageEl: HTMLElement, page: Extract<LessonPage, { kind: 'text' }>): void {
    const heading = document.createElement('h2');
    heading.className = 'preview-text-heading';
    heading.textContent = page.heading;
    pageEl.append(heading);

    for (const text of page.paragraphs) {
      const paragraph = document.createElement('p');
      paragraph.textContent = text;
      pageEl.append(paragraph);
    }
  }

  private renderExample(pageEl: HTMLElement, page: Extract<LessonPage, { kind: 'example' }>): void {
    pageEl.innerHTML = EXAMPLE_TEMPLATE;
    const find = <T extends HTMLElement>(selector: string) => pageEl.querySelector(selector) as T;
    find<HTMLElement>('.preview-example-caption').textContent = page.caption;

    // The containers are on the page now, so the demo can measure them.
    const demo = new LessonDemo(page.demo);
    demo.mount(find<HTMLElement>('.preview-example-blocks'), find<HTMLDivElement>('.preview-example-grid'));
    this.demo = demo;

    const runButton = find<HTMLButtonElement>('.preview-button.run');
    runButton.addEventListener('click', async () => {
      runButton.disabled = true;
      await demo.run();
      runButton.disabled = false;
    });
  }
}
