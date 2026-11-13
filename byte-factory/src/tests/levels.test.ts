import { describe, it, expect } from 'vitest';
import { LevelRegistry } from '../levels';
import { levels } from '../levels/data';
import { Level } from '../levels/types';
import { Position } from '../interpreter/types';

function makeLevel(id: string): Level {
    return {
        id,
        allowedBlocks: ['move_right'],
        blockLimit: 5,
        instructions: `Level ${id}`,
        map: { width: 3, height: 3, start: { x: 0, y: 0 }, goal: { x: 2, y: 2 }, walls: [] },
    };
}

function isInside(level: Level, pos: Position): boolean {
    return pos.x >= 0 && pos.y >= 0 && pos.x < level.map.width && pos.y < level.map.height;
}

function isWall(level: Level, pos: Position): boolean {
    return level.map.walls.some((wall) => wall.x === pos.x && wall.y === pos.y);
}

describe('LevelRegistry', () => {
    const a = makeLevel('a');
    const b = makeLevel('b');
    const c = makeLevel('c');
    const registry = new LevelRegistry([a, b, c]);

    it('throws on duplicate ids', () => {
        expect(() => new LevelRegistry([a, makeLevel('a')])).toThrow('Duplicate level id: a');
    });

    describe('get', () => {
        it('returns the level with the given id', () => {
            expect(registry.get('b')).toBe(b);
        });

        it('returns undefined for an unknown id', () => {
            expect(registry.get('missing')).toBeUndefined();
        });
    });

    describe('first', () => {
        it('returns the first level', () => {
            expect(registry.first()).toBe(a);
        });

        it('returns undefined when there are no levels', () => {
            expect(new LevelRegistry([]).first()).toBeUndefined();
        });
    });

    describe('next', () => {
        it('returns the following level', () => {
            expect(registry.next('a')).toBe(b);
            expect(registry.next('b')).toBe(c);
        });

        it('returns undefined after the last level', () => {
            expect(registry.next('c')).toBeUndefined();
        });

        it('returns undefined for an unknown id', () => {
            expect(registry.next('missing')).toBeUndefined();
        });
    });
});

describe('level data', () => {
    it('has unique ids', () => {
        expect(() => new LevelRegistry(levels)).not.toThrow();
    });

    it.each(levels.map((level) => [level.id, level]))('level %s is well-formed', (_id, level) => {
        expect(level.id).not.toBe('');
        expect(level.instructions).not.toBe('');
        expect(level.allowedBlocks.length).toBeGreaterThan(0);
        expect(level.blockLimit).toBeGreaterThan(0);
    });

    it.each(levels.map((level) => [level.id, level]))('level %s has a playable grid', (_id, level) => {
        expect(level.map.width).toBeGreaterThan(0);
        expect(level.map.height).toBeGreaterThan(0);
        expect(isInside(level, level.map.start)).toBe(true);
        expect(isInside(level, level.map.goal)).toBe(true);
        expect(isWall(level, level.map.start)).toBe(false);
        expect(isWall(level, level.map.goal)).toBe(false);
        expect(level.map.start).not.toEqual(level.map.goal);
    });
});
