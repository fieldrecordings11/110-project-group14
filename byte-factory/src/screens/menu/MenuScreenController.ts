import Konva from 'konva';
import type { Screen } from '../../app/Screen';
import { MenuScreenView } from './MenuScreenView';
import './menu.css';

const TEMPLATE = `
  <main class="menu-screen">
    <header class="menu-topbar">
      <span class="menu-brand">BF<span> / BYTE FACTORY</span></span>
      <span class="menu-status">FACTORY ONLINE</span>
    </header>
    <section class="menu-content" aria-labelledby="menuTitle">
      <div class="menu-intro">
        <h1 id="menuTitle">BYTE<br><span>FACTORY</span></h1>
        <p class="menu-description">Program robots. Rebuild the factory.<br>Learn to code, one block at a time.</p>
        <button id="menuPlayButton" class="menu-play" type="button">PLAY <span aria-hidden="true">→</span></button>
        <div class="menu-minigames">
          <button id="menuHangmanButton" type="button">HANGMAN<span>Vocabulary challenge</span></button>
          <button id="menuTriviaButton" type="button" disabled>TRIVIA<span>Coming soon</span></button>
        </div>
      </div>
      <div class="menu-art">
        <p class="menu-robot-label">MEET YOUR CODING COMPANION</p>
        <div class="menu-robot" aria-hidden="true"></div>
        <p class="menu-robot-name">BYTE <span>READY TO BUILD</span></p>
      </div>
    </section>
    <footer class="menu-footer">
      <div class="menu-conveyor" aria-hidden="true"></div>
      <div class="menu-footer-text"><span>Team 14</span><span>BUILD. RUN. LEARN. REPEAT.</span></div>
    </footer>
  </main>`;

/** Uses the same HTML controls and Konva drawing split as the level screen. */
export class MenuScreenController implements Screen {
  private stage: Konva.Stage | null = null;
  private view: MenuScreenView | null = null;

  constructor(
    private readonly onPlay: () => void,
    private readonly onHangman?: () => void,
    private readonly onTrivia?: () => void,
  ) {}

  mount(root: HTMLElement): void {
    root.innerHTML = TEMPLATE;
    const playButton = root.querySelector('#menuPlayButton') as HTMLButtonElement;
    const hangmanButton = root.querySelector('#menuHangmanButton') as HTMLButtonElement;
    const triviaButton = root.querySelector('#menuTriviaButton') as HTMLButtonElement;
    playButton.addEventListener('click', this.onPlay);

    hangmanButton.disabled = !this.onHangman;
    if (this.onHangman) {
      hangmanButton.addEventListener('click', this.onHangman);
    }
    if (this.onTrivia) {
      triviaButton.disabled = false;
      triviaButton.querySelector('span')!.textContent = 'Knowledge challenge';
      triviaButton.addEventListener('click', this.onTrivia);
    }

    const canvas = root.querySelector('.menu-robot') as HTMLDivElement;
    this.stage = new Konva.Stage({ container: canvas, width: 360, height: 320 });
    const layer = new Konva.Layer({ imageSmoothingEnabled: false, listening: false });
    this.view = new MenuScreenView();
    layer.add(this.view.getGroup());
    this.stage.add(layer);

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!reduceMotion) {
      this.view.startAnimation(layer);
    }
  }

  unmount(): void {
    this.view?.stopAnimation();
    this.stage?.destroy();
    this.view = null;
    this.stage = null;
  }
}
