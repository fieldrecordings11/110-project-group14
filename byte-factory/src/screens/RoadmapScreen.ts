import type { Screen } from '../app/Screen';
import { showHub } from './hub';
import type { MinigameEntry } from './hub';
import type { RoadmapLevel } from './roadmap';

export type RoadmapScreenOptions = {
  levels: RoadmapLevel[];
  /** Minigame shown on the left of the roadmap. */
  left: MinigameEntry;
  /** Minigame shown on the right of the roadmap. */
  right: MinigameEntry;
  onSelectLevel: (levelId: string) => void;
  onSelectMinigame: (minigameId: string) => void;
  onBack: () => void;
};

/** The roadmap screen: "you" on top, a minigame on each side of the roadmap, plus a button back to the menu. */
export class RoadmapScreen implements Screen {
  private destroyHub: (() => void) | null = null;

  constructor(private readonly options: RoadmapScreenOptions) {}

  mount(root: HTMLElement): void {
    const back = document.createElement('button');
    back.type = 'button';
    back.className = 'screen-back';
    back.textContent = '← Menu';
    back.addEventListener('click', this.options.onBack);

    const container = document.createElement('div');
    root.append(back, container);
    this.destroyHub = showHub(container, {
      levels: this.options.levels,
      left: this.options.left,
      right: this.options.right,
      onSelectLevel: this.options.onSelectLevel,
      onSelectMinigame: this.options.onSelectMinigame,
    });
  }

  unmount(): void {
    this.destroyHub?.();
    this.destroyHub = null;
  }
}
