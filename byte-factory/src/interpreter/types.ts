// Shared types for running a program and animating the result.

export type Direction = 'up' | 'down' | 'right' | 'left';

/** Grid coordinates: x = column, y = row, (0, 0) is the top-left tile. */
export type Position = { x: number; y: number };

export type GridMap = {
  width: number;
  height: number;
  start: Position;
  goal: Position;
  walls: Position[];
};

/** One thing the robot did, in order. `blockId` is the block that caused it. */
export type TraceStep =
  | { kind: 'move'; blockId: string | null; direction: Direction; from: Position; to: Position }
  | { kind: 'bump'; blockId: string | null; direction: Direction; at: Position; target: Position };

export type RunOutcome =
  | 'reached_goal'
  | 'stopped_short'
  | 'hit_wall'
  | 'too_many_steps'
  | 'runtime_error';

export type RunResult = {
  trace: TraceStep[];
  outcome: RunOutcome;
  /** Player-facing explanation of the outcome. */
  message: string;
  finalPosition: Position;
};
