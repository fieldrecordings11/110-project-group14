import type { Screen } from '../../app/Screen';
import { Lesson } from '../../lessons/types';
import { Level } from '../../levels/types';
import { LessonDemo } from './LessonDemo';
import './preview.css';

export type LevelPreviewScreenOptions = {
  level: Level;
  lesson: Lesson;
  /** Start Level / Skip to Level. */
  onStart: () => void;
  onBack: () => void;
};

const TEMPLATE = `
  <div class="preview-screen">
    <header class="preview-header">
      <button id="previewBack" type="button">Back</button>
      <h1 id="previewTitle"></h1>
      <p id="previewSubtitle"></p>
    </header>

    <section id="previewCard" class="preview-card">
      <!-- filled by renderPage(): a text page or an example page -->
    </section>

    <footer class="preview-footer">
      <button id="previewSkip" type="button">Skip to Level</button>
      <span id="previewPageCount"></span>
      <button id="previewPrev" type="button">Prev</button>
      <button id="previewNext" type="button">Next</button>
    </footer>
  </div>`;

/** Lesson pages shown before a level: read the lesson, watch a demo, then start the level. */
export class LevelPreviewScreen implements Screen {
  private pageIndex = 0;
  private demo: LessonDemo | null = null;

  constructor(private readonly options: LevelPreviewScreenOptions) {}

  mount(root: HTMLElement): void {
    // TODO:
    // 1. root.innerHTML = TEMPLATE; fill title ("Level N: <level.title>") and lesson.subtitle
    // 2. wire Back -> onBack, Skip -> onStart, Prev/Next -> goTo(pageIndex -/+ 1)
    // 3. renderPage()
  }

  unmount(): void {
    // TODO: destroy the current demo (Konva stage + Blockly workspace) if there is one
  }

  private goTo(index: number): void {
    // TODO: clamp to [0, pages.length - 1], set pageIndex, renderPage()
  }

  /** Draw the current page into #previewCard and update the footer. */
  private renderPage(): void {
    // TODO:
    // - destroy the previous page's demo first
    // - text page: heading + one <p> per paragraph
    // - example page: caption, a blocks container, a grid container and a Run Demo button;
    //   new LessonDemo(page.demo).mount(...) and wire the button to demo.run()
    // - footer: "N / total", disable Prev on the first page,
    //   and on the last page Next becomes "Start Level" (calls onStart)
  }
}
