import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as Blockly from 'blockly/core';
import { stack, workspaceWith } from './helpers';
import { LevelRegistry } from '../levels';
import { LevelLoader } from '../levels/loader';
import { Level } from '../levels/types';

function makeLevel(id: string, startState?: object): Level {
    return {
        id,
        allowedBlocks: ['move_right'],
        blockLimit: 5,
        instructions: `Level ${id}`,
        map: { width: 3, height: 3, start: { x: 0, y: 0 }, goal: { x: 2, y: 2 }, walls: [] },
        startState,
    };
}

function blockTypes(workspace: Blockly.Workspace): string[] {
    return workspace.getAllBlocks(true).map((block) => block.type);
}

describe('LevelLoader', () => {
    const a = makeLevel('a');
    const b = makeLevel('b', { blocks: { languageVersion: 0, blocks: [stack('move_up', 'move_down')] } });
    const c = makeLevel('c');
    const registry = new LevelRegistry([a, b, c]);
    let workspace: Blockly.Workspace;
    let loader: LevelLoader;

    beforeEach(() => {
        // starts with a block left over from "the previous level"
        workspace = workspaceWith(stack('move_left'));
        loader = new LevelLoader(workspace, registry);
    });

    afterEach(() => {
        workspace.dispose();
    });

    it('has no current level before anything is loaded', () => {
        expect(loader.currentLevel).toBeUndefined();
    });

    describe('loadLevel', () => {
        it('clears the workspace when the level has no start state', () => {
            expect(loader.loadLevel(a)).toBe(a);
            expect(blockTypes(workspace)).toEqual([]);
            expect(loader.currentLevel).toBe(a);
        });

        it('replaces the workspace with the start state', () => {
            loader.loadLevel(b);

            expect(blockTypes(workspace)).toEqual(['move_up', 'move_down']);
        });
    });

    describe('loadFirst', () => {
        it('loads the first level', () => {
            expect(loader.loadFirst()).toBe(a);
            expect(loader.currentLevel).toBe(a);
            expect(blockTypes(workspace)).toEqual([]);
        });

        it('returns undefined and leaves the workspace alone when there are no levels', () => {
            const empty = new LevelLoader(workspace, new LevelRegistry([]));

            expect(empty.loadFirst()).toBeUndefined();
            expect(empty.currentLevel).toBeUndefined();
            expect(blockTypes(workspace)).toEqual(['move_left']);
        });
    });

    describe('loadNext', () => {
        it('loads the first level when none is loaded yet', () => {
            expect(loader.loadNext()).toBe(a);
        });

        it('loads the levels in order', () => {
            loader.loadFirst();

            expect(loader.loadNext()).toBe(b);
            expect(blockTypes(workspace)).toEqual(['move_up', 'move_down']);
            expect(loader.loadNext()).toBe(c);
            expect(blockTypes(workspace)).toEqual([]);
        });

        it('returns undefined after the last level and keeps the workspace', () => {
            loader.loadLevel(c);
            workspace.newBlock('move_right');

            expect(loader.loadNext()).toBeUndefined();
            expect(loader.currentLevel).toBe(c);
            expect(blockTypes(workspace)).toEqual(['move_right']);
        });
    });

    describe('resetLevel', () => {
        it('restores the start state of the current level', () => {
            loader.loadLevel(b);
            workspace.newBlock('move_right');

            expect(loader.resetLevel()).toBe(b);
            expect(blockTypes(workspace)).toEqual(['move_up', 'move_down']);
        });

        it('throws when no level is loaded yet', () => {
            expect(() => loader.resetLevel()).toThrow('No level loaded yet');
        });
    });
});
