export type Level = {
  id: string;
  allowedBlocks: string[];   // block types, e.g. "move_up", "controls_repeat_ext"
  blockLimit: number;        // max blocks the player may use
  instructions: string;
  startState?: object;
  // later: goal / grid / expected output, for checking if they solved it
};