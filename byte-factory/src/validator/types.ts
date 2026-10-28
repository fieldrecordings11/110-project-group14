export type ValidationResult =
  | { ok: true }
  | { ok: false; reason: "block_not_allowed" | "too_many_blocks" | "empty_program";
      message: string; blockId?: string };