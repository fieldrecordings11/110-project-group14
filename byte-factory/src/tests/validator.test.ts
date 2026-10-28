import { describe, it, expect, beforeAll, beforeEach, afterEach } from "vitest";
import * as Blockly from "blockly/core";
import "blockly/blocks"; // built-in blocks, e.g. "text", "logic_boolean"
import { Validator } from "../validator/validator";
import { Level } from "../levels/types";

const level: Level = {
    id: "test-level",
    allowedBlocks: ["text", "logic_boolean"],
    blockLimit: 2,
    instructions: "Test level",
};

describe("Validator", () => {
    const validator = new Validator();
    let workspace: Blockly.Workspace;

    beforeAll(() => {
        // the real "start" block isn't defined yet; this stand-in only needs the type name
        if (!Blockly.Blocks["start"]) {
            Blockly.common.defineBlocksWithJsonArray([
                { type: "start", message0: "start", nextStatement: null },
            ]);
        }
    });

    beforeEach(() => {
        workspace = new Blockly.Workspace();
    });

    afterEach(() => {
        workspace.dispose();
    });

    it("rejects an empty workspace", () => {
        const result = validator.validate(workspace, level);

        expect(result).toMatchObject({ ok: false, reason: "empty_program" });
    });

    it("rejects a workspace with only the start block", () => {
        workspace.newBlock("start");

        const result = validator.validate(workspace, level);

        expect(result).toMatchObject({ ok: false, reason: "empty_program" });
    });

    it("accepts allowed blocks under the limit", () => {
        workspace.newBlock("text");

        expect(validator.validate(workspace, level)).toEqual({ ok: true });
    });

    it("accepts allowed blocks exactly at the limit", () => {
        workspace.newBlock("text");
        workspace.newBlock("logic_boolean");

        expect(validator.validate(workspace, level)).toEqual({ ok: true });
    });

    it("rejects a block that isn't allowed and reports its id", () => {
        workspace.newBlock("text");
        const notAllowed = workspace.newBlock("math_number");

        const result = validator.validate(workspace, level);

        expect(result).toMatchObject({
            ok: false,
            reason: "block_not_allowed",
            blockId: notAllowed.id,
        });
    });

    it("rejects more blocks than the limit", () => {
        workspace.newBlock("text");
        workspace.newBlock("text");
        workspace.newBlock("logic_boolean");

        const result = validator.validate(workspace, level);

        expect(result).toMatchObject({ ok: false, reason: "too_many_blocks" });
    });

    it("doesn't count the start block toward the limit", () => {
        workspace.newBlock("start");
        workspace.newBlock("text");
        workspace.newBlock("logic_boolean");

        expect(validator.validate(workspace, level)).toEqual({ ok: true });
    });

    it("reports a disallowed block before checking the limit", () => {
        workspace.newBlock("text");
        workspace.newBlock("text");
        workspace.newBlock("math_number");

        const result = validator.validate(workspace, level);

        expect(result).toMatchObject({ ok: false, reason: "block_not_allowed" });
    });
});
