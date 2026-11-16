import type { Screen } from '../app/Screen';
import { RoadmapLevel, showRoadmap } from './roadmap';

export type RoadmapScreenOptions = {
  levels: RoadmapLevel[];
  onSelectLevel: (levelId: string) => void;
  onBack: () => void;
};

/** The roadmap screen: showRoadmap plus a button back to the menu. */
export class RoadmapScreen implements Screen {
  private destroyRoadmap: (() => void) | null = null;

  constructor(private readonly options: RoadmapScreenOptions) {}

  mount(root: HTMLElement): void {
    const back = document.createElement('button');
    back.type = 'button';
    back.className = 'screen-back';
    back.textContent = '← Menu';
    back.addEventListener('click', this.options.onBack);

    const container = document.createElement('div');
    root.append(back, container);
    this.destroyRoadmap = showRoadmap(container, this.options.levels, this.options.onSelectLevel);
  }

  unmount(): void {
    this.destroyRoadmap?.();
    this.destroyRoadmap = null;
  }
}
