// @vitest-environment jsdom
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {getLevelStatus, showRoadmap} from './roadmap';
import type {RoadmapLevel} from './roadmap';
import {loadRoadmapProgress, saveRoadmapProgress} from './roadmap-progress';
import {setupRoadmapPreview} from './roadmap-preview';

const canvas = vi.hoisted(() => ({destroy: vi.fn(), disconnect: vi.fn()}));
vi.mock('konva', () => {
  class Shape {
    add() {}
    x() {}
    position() {}
    scale() {}
    batchDraw() {}
    width() {}
    destroy = canvas.destroy;
  }
  return {default: {Stage: Shape, Layer: Shape, Group: Shape, Line: Shape, Circle: Shape, Rect: Shape}};
});

const levels: RoadmapLevel[] = [
  {id: 'intro', title: 'First steps', y: 350, status: 'available'},
  {id: 'repeat', title: 'Repeat actions', y: 220, status: 'locked'},
  {id: 'logic', title: 'Make decisions', y: 90, status: 'locked'},
];

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
  document.body.innerHTML = '<div id="roadmap"></div>';
  vi.stubGlobal('ResizeObserver', class {
    observe() {}
    disconnect = canvas.disconnect;
  });
});
afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('roadmap progress', () => {
  it.each([
    [[], ['available', 'locked', 'locked']],
    [['intro'], ['completed', 'available', 'locked']],
    [['intro', 'repeat'], ['completed', 'completed', 'available']],
    [['intro', 'repeat', 'logic'], ['completed', 'completed', 'completed']],
  ])('unlocks levels in order for %j', (completed, expected) => {
    expect(levels.map((level, index) => getLevelStatus(level.id, index, levels, completed))).toEqual(expected);
  });

  it('restores saved progress after the screen is revisited', () => {
    expect(loadRoadmapProgress()).toEqual([]);
    expect(saveRoadmapProgress(['intro'])).toBe(true);
    expect(loadRoadmapProgress()).toEqual(['intro']);
    saveRoadmapProgress([]);
    expect(loadRoadmapProgress()).toEqual([]);
  });

  it('recovers from corrupt or incorrectly shaped storage', () => {
    for (const value of ['broken json', '{}', '[1]', 'null']) {
      localStorage.setItem('byteFactory.roadmap.completedLevels', value);
      expect(loadRoadmapProgress()).toEqual([]);
    }
  });

  it('handles unavailable storage without crashing', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {throw new Error('blocked');});
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {throw new Error('quota');});
    expect(loadRoadmapProgress()).toEqual([]);
    expect(saveRoadmapProgress(['intro'])).toBe(false);
  });
});

describe('roadmap screen', () => {
  it('runs the preview selection, completion, return, and reset flow', () => {
    document.body.innerHTML = `
      <button id="complete-preview-level" disabled>Complete</button>
      <button id="reset-preview-progress">Reset</button>
      <p id="preview-status"></p>
      <div id="roadmap-preview"></div>`;
    setupRoadmapPreview();
    const complete = document.getElementById('complete-preview-level') as HTMLButtonElement;
    const levelButtons = () => document.querySelectorAll<HTMLButtonElement>('.roadmap-level');
    expect(complete.disabled).toBe(true);
    expect(levelButtons()[1].disabled).toBe(true);
    levelButtons()[0].click();
    expect(loadRoadmapProgress()).toEqual([]);
    complete.click();
    expect(loadRoadmapProgress()).toEqual(['1']);
    expect(levelButtons()[1].disabled).toBe(false);
    expect(levelButtons()[2].disabled).toBe(true);

    window.dispatchEvent(new Event('pagehide'));
    expect(document.querySelector('.roadmap')).toBeNull();
    const returning = new Event('pageshow');
    Object.defineProperty(returning, 'persisted', {value: true});
    window.dispatchEvent(returning);
    expect(levelButtons()[0].className).toContain('completed');
    expect(levelButtons()[1].disabled).toBe(false);

    document.getElementById('reset-preview-progress')!.click();
    expect(loadRoadmapProgress()).toEqual([]);
    expect(levelButtons()[0].disabled).toBe(false);
    expect(levelButtons()[1].disabled).toBe(true);
    window.dispatchEvent(new Event('pagehide'));
  });

  it('only selects unlocked levels and does not mark selection complete', () => {
    const container = document.getElementById('roadmap')!;
    const select = vi.fn();
    const destroy = showRoadmap(container, levels, select);
    const buttons = container.querySelectorAll('button');
    buttons[1].click();
    expect(select).not.toHaveBeenCalled();
    buttons[0].click();
    expect(select).toHaveBeenCalledExactlyOnceWith('intro');
    expect(loadRoadmapProgress()).toEqual([]);
    destroy();
  });

  it('disposes old stages on rerender and cleans up only once', () => {
    const container = document.getElementById('roadmap')!;
    const first = showRoadmap(container, levels, () => {});
    const second = showRoadmap(container, levels, () => {});
    expect(canvas.destroy).toHaveBeenCalledTimes(1);
    first();
    expect(container.querySelectorAll('.roadmap')).toHaveLength(1);
    second();
    second();
    expect(canvas.destroy).toHaveBeenCalledTimes(2);
    expect(canvas.disconnect).toHaveBeenCalledTimes(2);
    expect(container.children).toHaveLength(0);
  });

});
