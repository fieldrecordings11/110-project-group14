import { Level } from "./types";
import { levels } from "./data";

export class LevelRegistry {
    private readonly levels: Level[];

    /**
     * @param levels
     * Levels in play order; ids must be unique
     */
    constructor(levels: Level[]) {
        const ids = new Set<string>();
        for (const level of levels) {
            if (ids.has(level.id)) {
                throw new Error(`Duplicate level id: ${level.id}`);
            }
            ids.add(level.id);
        }
        this.levels = levels;
    }

    /**
     * @returns the level with the given id, or undefined if none exists
     */
    get(id: string): Level | undefined {
        return this.levels.find((level) => level.id === id);
    }

    /**
     * @returns the first level, or undefined if there are no levels
     */
    first(): Level | undefined {
        return this.levels[0];
    }

    /**
     * @returns the level after the given id, or undefined if it is the last level or the id is unknown
     */
    next(id: string): Level | undefined {
        const index = this.levels.findIndex((level) => level.id === id);
        if (index === -1) {
            return undefined;
        }
        return this.levels[index + 1];
    }
}

export const levelRegistry = new LevelRegistry(levels);
