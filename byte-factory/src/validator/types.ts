export type Level = {
  id: string;
  allowedBlocks: string[];   // block types, e.g. "move_up", "controls_repeat_ext"
  blockLimit: number;        // max blocks the player may use
};

export type ValidationResult =
  | { ok: true }
  | { ok: false; reason: "block_not_allowed" | "too_many_blocks" | "empty_program";
      message: string; blockId?: string };

export type BlockInfo = {
    id: string;
    type: string;
}