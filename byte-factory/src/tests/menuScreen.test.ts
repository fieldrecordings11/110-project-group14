// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { MenuScreenController } from '../screens/menu/MenuScreenController';

const drawing = vi.hoisted(() => ({
  destroy: vi.fn(),
  startAnimation: vi.fn(),
  stopAnimation: vi.fn(),
}));

vi.mock('konva', () => ({
  default: {
    Stage: class {
      add() {}
      destroy = drawing.destroy;
    },
    Layer: class {
      add() {}
    },
  },
}));

vi.mock('../screens/menu/MenuScreenView', () => ({
  MenuScreenView: class {
    getGroup() { return {}; }
    startAnimation = drawing.startAnimation;
    stopAnimation = drawing.stopAnimation;
  },
}));

describe('Home screen', () => {
  let root: HTMLDivElement;
  let menu: MenuScreenController;
  const onPlay = vi.fn();
  const onHangman = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: false })));
    root = document.createElement('div');
    document.body.appendChild(root);
    menu = new MenuScreenController(onPlay, onHangman);
  });

  afterEach(() => {
    menu.unmount();
    root.remove();
    vi.unstubAllGlobals();
  });

  it('opens the existing main game and Hangman actions', () => {
    menu.mount(root);
    (root.querySelector('#menuPlayButton') as HTMLButtonElement).click();
    (root.querySelector('#menuHangmanButton') as HTMLButtonElement).click();
    expect(onPlay).toHaveBeenCalledOnce();
    expect(onHangman).toHaveBeenCalledOnce();
  });

  it('keeps Trivia disabled when no game is connected', () => {
    menu.mount(root);
    const trivia = root.querySelector('#menuTriviaButton') as HTMLButtonElement;
    expect(trivia.disabled).toBe(true);
    expect(trivia.textContent).toContain('Coming soon');
  });

  it('enables Trivia when a callback is supplied', () => {
    const onTrivia = vi.fn();
    menu = new MenuScreenController(onPlay, onHangman, onTrivia);
    menu.mount(root);
    const trivia = root.querySelector('#menuTriviaButton') as HTMLButtonElement;
    expect(trivia.disabled).toBe(false);
    trivia.click();
    expect(onTrivia).toHaveBeenCalledOnce();
  });

  it('stops animation and destroys the canvas when leaving', () => {
    menu.mount(root);
    expect(drawing.startAnimation).toHaveBeenCalledOnce();
    menu.unmount();
    expect(drawing.stopAnimation).toHaveBeenCalledOnce();
    expect(drawing.destroy).toHaveBeenCalledOnce();
  });

  it('does not animate the robot when reduced motion is preferred', () => {
    vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: true })));
    menu.mount(root);
    expect(drawing.startAnimation).not.toHaveBeenCalled();
  });
});
