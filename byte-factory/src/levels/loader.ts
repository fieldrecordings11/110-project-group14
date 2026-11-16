import * as Blockly from 'blockly/core';
import { LevelRegistry } from '.';
import { Level } from './types';

export class LevelLoader {
    private current: Level | undefined;

    /**
     * @param workspace
     * Blockly workspace to reset for each level (headless in tests)
     * @param registry
     * Levels to load from, in play order
     */
    constructor(
        private readonly workspace: Blockly.Workspace,
        private readonly registry: LevelRegistry,
    ) {}

    /**
     * @returns the level currently loaded, or undefined before the first load
     */
    get currentLevel(): Level | undefined {
        return this.current;
    }

    /**
     * Resets the workspace for the given level: clear it, load level.startState,
     * clear the undo stack, then make it the current level.
     * @returns the loaded level
     */
    loadLevel(level: Level): Level {
        this.workspace.clear();

        if (level.startState) {
            Blockly.serialization.workspaces.load(level.startState, this.workspace);
        }

        this.workspace.clearUndo();

        this.current = level;

        return level;
    }

    /**
     * @returns the first level, or undefined if there are no levels
     */
    loadFirst(): Level | undefined {
        const first = this.registry.first();

        if (first) {
            return this.loadLevel(first);
        }

        return first;
    }

    /**
     * @returns the level after the current one, the first level if none is loaded yet, or undefined after the last level
     */
    loadNext(): Level | undefined {
        if (!this.current) {
            return this.loadFirst();
        }

        const next = this.registry.next(this.current.id);

        if (!next) {
            return undefined;
        }

        return this.loadLevel(next);
    }

    /**
     * Reloads the current level's starting state.
     * @returns the current level
     */
    resetLevel(): Level {
        if (!this.current) {
            throw new Error('No level loaded yet');
        }

        return this.loadLevel(this.current);
    }
}
