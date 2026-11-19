import {showRoadmap} from './roadmap';
import type {RoadmapLevel} from './roadmap';
import './hub.css';

const activeHubs = new WeakMap<HTMLElement, () => void>();

/** A minigame ball shown beside the level map. */
export type MinigameEntry = {
  id: string;
  title: string;
  blurb: string;
  icon: string;
  /** Unavailable minigames are shown greyed out and can't be clicked. */
  available: boolean;
};

export type HubOptions = {
  levels: RoadmapLevel[];
  /** Minigame on the left of the map. */
  left: MinigameEntry;
  /** Minigame on the right of the map. */
  right: MinigameEntry;
  onSelectLevel: (levelId: string) => void;
  onSelectMinigame: (minigameId: string) => void;
};

function minigameBall(entry: MinigameEntry, onClick: (id: string) => void): HTMLButtonElement {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = `hub-ball hub-ball--${entry.available ? 'available' : 'locked'}`;
  button.disabled = !entry.available;
  button.dataset.minigame = entry.id;
  button.setAttribute('aria-label', `Minigame: ${entry.title}${entry.available ? '' : ', coming soon'}`);

  const circle = document.createElement('span');
  circle.className = 'hub-ball-circle';
  circle.setAttribute('aria-hidden', 'true');
  circle.textContent = entry.icon;
  const title = document.createElement('span');
  title.className = 'hub-ball-title';
  title.textContent = entry.title;
  const blurb = document.createElement('span');
  blurb.className = 'hub-ball-blurb';
  blurb.textContent = entry.blurb;

  button.append(circle, title, blurb);
  button.addEventListener('click', () => onClick(entry.id));
  return button;
}

/**
 * "You" at the top, branching into a minigame on the left, the level roadmap in the middle
 * and a minigame on the right. Returns a function that removes it.
 */
export function showHub(container: HTMLElement, options: HubOptions): () => void {
  activeHubs.get(container)?.();

  container.innerHTML = `
    <div class="hub">
      <header class="hub-header">
        <p class="hub-brand">BYTE FACTORY</p>
        <div class="hub-you">
          <svg width="40" height="56" viewBox="0 0 28 48" aria-hidden="true">
            <rect x="0" y="0" width="28" height="20" fill="#8fc4ff"/>
            <rect x="6" y="7" width="4" height="4" fill="#071412"/>
            <rect x="18" y="7" width="4" height="4" fill="#071412"/>
            <rect x="4" y="24" width="20" height="16" fill="#8fc4ff"/>
            <rect x="4" y="40" width="6" height="8" fill="#8fc4ff"/>
            <rect x="18" y="40" width="6" height="8" fill="#8fc4ff"/>
          </svg>
          <span>YOU</span>
        </div>
      </header>
      <div class="hub-branches" aria-hidden="true">
        <span class="hub-trunk"></span>
        <span class="hub-bar"></span>
        <span class="hub-drop hub-drop--left"></span>
        <span class="hub-drop hub-drop--center"></span>
        <span class="hub-drop hub-drop--right"></span>
      </div>
      <div class="hub-columns">
        <section class="hub-side hub-side--left" aria-label="Minigame"></section>
        <section class="hub-center" aria-label="Levels"></section>
        <section class="hub-side hub-side--right" aria-label="Minigame"></section>
      </div>
    </div>`;

  const left = container.querySelector('.hub-side--left');
  const right = container.querySelector('.hub-side--right');
  const center = container.querySelector('.hub-center');
  if (!(left instanceof HTMLElement) || !(right instanceof HTMLElement) || !(center instanceof HTMLElement)) {
    return () => {};
  }

  left.append(minigameBall(options.left, options.onSelectMinigame));
  right.append(minigameBall(options.right, options.onSelectMinigame));
  const destroyRoadmap = showRoadmap(center, options.levels, options.onSelectLevel);

  let destroyed = false;
  const destroy = () => {
    if (destroyed) return;
    destroyed = true;
    destroyRoadmap();
    container.innerHTML = '';
    if (activeHubs.get(container) === destroy) activeHubs.delete(container);
  };
  activeHubs.set(container, destroy);
  return destroy;
}
