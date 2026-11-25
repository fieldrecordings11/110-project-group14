import { describe, it, expect } from 'vitest';
import { Screen } from '../app/Screen';
import { ScreenManager } from '../app/ScreenManager';
import { ROADMAP_ENTRIES, RoadmapEntry, getEntryLevel, toRoadmapLevels } from '../app/roadmapEntries';
import { levels } from '../levels/data';
import { sequencingLevel } from '../levels/sequencing';

/** Records mount/unmount calls into a shared log. */
class FakeScreen implements Screen {
  constructor(private readonly name: string, private readonly log: string[]) {}
  mount(): void {
    this.log.push(`mount ${this.name}`);
  }
  unmount(): void {
    this.log.push(`unmount ${this.name}`);
  }
}

describe('ScreenManager', () => {
  it('unmounts the current screen and clears the root before mounting the next', () => {
    const log: string[] = [];
    const root = { replaceChildren: () => log.push('clear') } as unknown as HTMLElement;
    const app = new ScreenManager(root);

    app.show(new FakeScreen('menu', log));
    app.show(new FakeScreen('roadmap', log));

    expect(log).toEqual(['clear', 'mount menu', 'unmount menu', 'clear', 'mount roadmap']);
  });
});

describe('toRoadmapLevels', () => {
  const entries: RoadmapEntry[] = [
    { kind: 'hangman', id: 'a', title: 'A', questionsFor: 'x' },
    { kind: 'hangman', id: 'b', title: 'B', questionsFor: 'x' },
    { kind: 'hangman', id: 'c', title: 'C', questionsFor: 'x' },
  ];

  it('unlocks only the first stop when nothing is completed', () => {
    expect(toRoadmapLevels(entries, []).map((l) => l.status)).toEqual(['available', 'locked', 'locked']);
  });

  it('unlocks the stop after each completed one', () => {
    expect(toRoadmapLevels(entries, ['a']).map((l) => l.status)).toEqual(['completed', 'available', 'locked']);
  });

  it("shows a level stop with its level's title", () => {
    const withLevel: RoadmapEntry[] = [{ kind: 'level', id: 'a', levelId: sequencingLevel.id }];
    expect(toRoadmapLevels(withLevel, [])[0].title).toBe(sequencingLevel.title);
  });

  it('draws the first stop at the bottom of the map', () => {
    const ys = toRoadmapLevels(entries, []).map((l) => l.y);
    expect(ys[0]).toBeGreaterThan(ys[1]);
    expect(ys[1]).toBeGreaterThan(ys[2]);
  });
});

describe('ROADMAP_ENTRIES', () => {
  it('goes Sequencing, Hangman (on the sequencing questions), Loops, Conditionals', () => {
    expect(toRoadmapLevels(ROADMAP_ENTRIES, []).map((l) => l.title)).toEqual(['Sequencing', 'Hangman', 'Loops', 'Conditionals']);
    const hangman = ROADMAP_ENTRIES[1];
    expect(hangman.kind === 'hangman' && hangman.questionsFor).toBe(sequencingLevel.id);
  });

  it('has unique ids', () => {
    const ids = ROADMAP_ENTRIES.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('only points to levels that exist', () => {
    for (const entry of ROADMAP_ENTRIES) {
      if (entry.kind === 'level') expect(() => getEntryLevel(entry.levelId)).not.toThrow();
    }
  });

  it('includes every level', () => {
    const onRoadmap = ROADMAP_ENTRIES.map((e) => (e.kind === 'level' ? e.levelId : undefined));
    for (const level of levels) {
      expect(onRoadmap).toContain(level.id);
    }
  });
});

describe('getEntryLevel', () => {
  it('returns the level with the given id', () => {
    expect(getEntryLevel(sequencingLevel.id)).toBe(sequencingLevel);
  });

  it('throws for an unknown id', () => {
    expect(() => getEntryLevel('missing')).toThrow('Unknown level id: missing');
  });
});
