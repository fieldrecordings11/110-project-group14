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
     * Drawing level.map and the toolbox happen outside the loader (index.ts).
     * @returns the loaded level
     */
    loadLevel(level: Level): Level {
        throw new Error('Not yet implemented');
    }

    /**
     * @returns the first level, or undefined if there are no levels
     */
    loadFirst(): Level | undefined {
        throw new Error('Not yet implemented');
    }

    /**
     * @returns the level after the current one, or undefined after the last level
     */
    loadNext(): Level | undefined {
        throw new Error('Not yet implemented');
    }

    /**
     * Reloads the current level's starting state.
     * @returns the current level
     */
    resetLevel(): Level {
        throw new Error('Not yet implemented');
    }
}
