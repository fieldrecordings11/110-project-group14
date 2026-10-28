import { describe, it, expect } from "vitest";
import { LevelRegistry } from "../levels";
import { levels } from "../levels/data";
import { Level } from "../levels/types";

function makeLevel(id: string): Level {
    return { id, allowedBlocks: ["add_text"], blockLimit: 5, instructions: `Level ${id}` };
}

describe("LevelRegistry", () => {
    const a = makeLevel("a");
    const b = makeLevel("b");
    const c = makeLevel("c");
    const registry = new LevelRegistry([a, b, c]);

    it("throws on duplicate ids", () => {
        expect(() => new LevelRegistry([a, makeLevel("a")])).toThrow("Duplicate level id: a");
    });

    describe("get", () => {
        it("returns the level with the given id", () => {
            expect(registry.get("b")).toBe(b);
        });

        it("returns undefined for an unknown id", () => {
            expect(registry.get("missing")).toBeUndefined();
        });
    });

    describe("first", () => {
        it("returns the first level", () => {
            expect(registry.first()).toBe(a);
        });

        it("returns undefined when there are no levels", () => {
            expect(new LevelRegistry([]).first()).toBeUndefined();
        });
    });

    describe("next", () => {
        it("returns the following level", () => {
            expect(registry.next("a")).toBe(b);
            expect(registry.next("b")).toBe(c);
        });

        it("returns undefined after the last level", () => {
            expect(registry.next("c")).toBeUndefined();
        });

        it("returns undefined for an unknown id", () => {
            expect(registry.next("missing")).toBeUndefined();
        });
    });
});

describe("level data", () => {
    it("has unique ids", () => {
        expect(() => new LevelRegistry(levels)).not.toThrow();
    });

    it.each(levels.map((level) => [level.id, level]))("level %s is well-formed", (_id, level) => {
        expect(level.id).not.toBe("");
        expect(level.instructions).not.toBe("");
        expect(level.allowedBlocks.length).toBeGreaterThan(0);
        expect(level.blockLimit).toBeGreaterThan(0);
    });
});
