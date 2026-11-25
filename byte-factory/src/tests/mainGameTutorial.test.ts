// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { MainGameTutorial, shouldShowMainGameTutorial } from '../tutorial/MainGameTutorial';
import { MAIN_GAME_TUTORIAL_STEPS } from '../tutorial/steps';

const q = <T extends HTMLElement = HTMLElement>(selector: string) =>
  document.querySelector(selector) as T;
const title = () => q('#tutorialTitle').textContent;
const press = (key: string) => document.dispatchEvent(new KeyboardEvent('keydown', { key }));

describe('MainGameTutorial', () => {
  let tutorial: MainGameTutorial;

  beforeEach(() => {
    vi.useFakeTimers();
    window.localStorage.clear();
    tutorial = new MainGameTutorial();
  });

  afterEach(() => {
    tutorial.close();
    vi.runAllTimers();
    vi.useRealTimers();
    document.body.innerHTML = '';
  });

  it('opens on the first page with one dot per page and Back disabled', () => {
    tutorial.open();

    expect(tutorial.isOpen()).toBe(true);
    expect(title()).toBe(MAIN_GAME_TUTORIAL_STEPS[0].title);
    expect(document.querySelectorAll('.tutorial-dot')).toHaveLength(MAIN_GAME_TUTORIAL_STEPS.length);
    expect(q<HTMLButtonElement>('.tutorial-prev').disabled).toBe(true);
  });

  it('pages forward and back with the arrow buttons', () => {
    tutorial.open();

    q('.tutorial-next').click();
    expect(tutorial.currentPage()).toBe(1);
    expect(title()).toBe(MAIN_GAME_TUTORIAL_STEPS[1].title);
    expect(q<HTMLButtonElement>('.tutorial-prev').disabled).toBe(false);

    q('.tutorial-prev').click();
    expect(tutorial.currentPage()).toBe(0);
  });

  it('pages with the arrow keys and closes on Escape', () => {
    const onClose = vi.fn();
    tutorial.open(onClose);

    press('ArrowRight');
    press('ArrowRight');
    expect(tutorial.currentPage()).toBe(2);
    press('ArrowLeft');
    expect(tutorial.currentPage()).toBe(1);

    press('Escape');
    expect(tutorial.isOpen()).toBe(false);
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('jumps to a page when its dot is clicked', () => {
    tutorial.open();

    (document.querySelectorAll('.tutorial-dot')[4] as HTMLElement).click();
    expect(tutorial.currentPage()).toBe(4);
  });

  it('highlights the part of the mock each page points at', () => {
    tutorial.open();
    const target = MAIN_GAME_TUTORIAL_STEPS.findIndex((step) => step.target === 'run');

    tutorial.goTo(target);

    expect(q('.tut-mock').dataset.active).toBe('run');
    expect(q('[data-part="run"]').classList.contains('tut-focused')).toBe(true);
    expect(q('.tut-arrow').classList.contains('hidden')).toBe(false);
  });

  it('every page target exists in the mock', () => {
    tutorial.open();
    for (const step of MAIN_GAME_TUTORIAL_STEPS) {
      if (step.target) expect(q(`[data-part="${step.target}"]`)).not.toBeNull();
    }
  });

  it('skip closes the tutorial and removes it from the page', () => {
    const onClose = vi.fn();
    tutorial.open(onClose);

    q('.tutorial-skip').click();
    expect(onClose).toHaveBeenCalledOnce();
    expect(tutorial.isOpen()).toBe(false);

    vi.runAllTimers();
    expect(q('.tutorial-overlay')).toBeNull();
  });

  it('the last page finishes the tutorial', () => {
    const onClose = vi.fn();
    tutorial.open(onClose);
    tutorial.goTo(MAIN_GAME_TUTORIAL_STEPS.length - 1);

    expect(q('.tutorial-next').classList.contains('finish')).toBe(true);
    q('.tutorial-next').click();
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('stops listening for keys after closing', () => {
    tutorial.open();
    tutorial.close();

    press('ArrowRight');
    expect(tutorial.currentPage()).toBe(0);
  });

  it('remembers "Don\'t show this again"', () => {
    expect(shouldShowMainGameTutorial()).toBe(true);
    tutorial.open();

    const hide = q<HTMLInputElement>('.tutorial-hide-input');
    hide.checked = true;
    hide.dispatchEvent(new Event('change'));
    expect(shouldShowMainGameTutorial()).toBe(false);

    hide.checked = false;
    hide.dispatchEvent(new Event('change'));
    expect(shouldShowMainGameTutorial()).toBe(true);
  });
});
