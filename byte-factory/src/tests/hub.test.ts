// @vitest-environment jsdom
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {showHub} from '../screens/hub';
import type {HubOptions, MinigameEntry} from '../screens/hub';

vi.mock('konva', () => {
  class Shape {
    add() {}
    x() {}
    position() {}
    scale() {}
    batchDraw() {}
    width() {}
    destroy() {}
  }
  return {default: {Stage: Shape, Layer: Shape, Group: Shape, Line: Shape, Circle: Shape, Rect: Shape}};
});

const hangman: MinigameEntry = {id: 'hangman', title: 'Hangman', blurb: 'words', icon: 'H', available: true};
const trivia: MinigameEntry = {id: 'trivia', title: 'Trivia', blurb: 'soon', icon: 'T', available: false};

function options(overrides: Partial<HubOptions> = {}): HubOptions {
  return {
    levels: [
      {id: '1', title: 'First', status: 'available', y: 220},
      {id: '2', title: 'Second', status: 'locked', y: 90},
    ],
    left: trivia,
    right: hangman,
    onSelectLevel: vi.fn(),
    onSelectMinigame: vi.fn(),
    ...overrides,
  };
}

let container: HTMLElement;

beforeEach(() => {
  document.body.innerHTML = '<div id="hub"></div>';
  container = document.getElementById('hub') as HTMLElement;
  vi.stubGlobal('ResizeObserver', class {
    observe() {}
    disconnect() {}
  });
});
afterEach(() => {
  vi.unstubAllGlobals();
});

describe('showHub', () => {
  it('puts a minigame on each side of the level map', () => {
    showHub(container, options());
    expect(container.querySelector('.hub-side--left [data-minigame="trivia"]')).not.toBeNull();
    expect(container.querySelector('.hub-side--right [data-minigame="hangman"]')).not.toBeNull();
    expect(container.querySelectorAll('.hub-center .roadmap-level')).toHaveLength(2);
  });

  it('selects a level when its ball is clicked', () => {
    const onSelectLevel = vi.fn();
    showHub(container, options({onSelectLevel}));
    (container.querySelector('.roadmap-level--available') as HTMLButtonElement).click();
    expect(onSelectLevel).toHaveBeenCalledWith('1');
  });

  it('opens an available minigame and ignores a disabled one', () => {
    const onSelectMinigame = vi.fn();
    showHub(container, options({onSelectMinigame}));
    (container.querySelector('[data-minigame="trivia"]') as HTMLButtonElement).click();
    expect(onSelectMinigame).not.toHaveBeenCalled();
    (container.querySelector('[data-minigame="hangman"]') as HTMLButtonElement).click();
    expect(onSelectMinigame).toHaveBeenCalledWith('hangman');
  });

  it('removes itself when destroyed', () => {
    showHub(container, options())();
    expect(container.innerHTML).toBe('');
  });
});
