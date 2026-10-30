import { describe, it, expect } from "vitest";
import { Validator } from "../validator/validator";
import { Level } from "../validator/types";
import { repeat, stack, workspaceWith } from "./helpers";

const level: Level = {
  id: "test",
  allowedBlocks: ["move_right", "move_down", "controls_repeat_ext", "math_number"],
  blockLimit: 3,
};

describe("Validator", () => {
  const validator = new Validator();

  it("rejects an empty program", () => {
    const result = validator.validate(workspaceWith(), level);
    expect(result).toMatchObject({ ok: false, reason: "empty_program" });
  });

  it("rejects blocks the level doesn't allow, pointing at the block", () => {
    const ws = workspaceWith(stack("move_right", "move_up"));
    const upId = ws.getAllBlocks(true)[1].id;
    const result = validator.validate(ws, level);
    expect(result).toMatchObject({ ok: false, reason: "block_not_allowed", blockId: upId });
  });

  it("rejects programs over the block limit", () => {
    const ws = workspaceWith(stack("move_right", "move_right", "move_down", "move_down"));
    expect(validator.validate(ws, level)).toMatchObject({ ok: false, reason: "too_many_blocks" });
  });

  it("accepts a valid program", () => {
    const ws = workspaceWith(repeat(2, stack("move_right")));
    expect(validator.validate(ws, level)).toEqual({ ok: true });
  });
});
