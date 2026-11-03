import * as Blockly from 'blockly/core';
import { javascriptGenerator } from 'blockly/javascript';
import { forBlock as moveGeneration } from '../generators/moveGeneration';
import { Direction, GridMap, Position, RunOutcome, RunResult, TraceStep } from './types';

// The movement generators emit move(n); this is the meaning of n.
const DIRECTIONS: Direction[] = ['up', 'down', 'right', 'left'];

const OFFSETS: Record<Direction, Position> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  right: { x: 1, y: 0 },
  left: { x: -1, y: 0 },
};

/** Loop iterations allowed before we assume the program never ends. */
export const MAX_LOOP_ITERATIONS = 1000;
/** Robot actions allowed in one run. */
export const MAX_TRACE_STEPS = 500;

/** Thrown inside the running program to stop it early with a known outcome. */
class StopProgram extends Error {
  constructor(
    readonly outcome: RunOutcome,
    message: string,
  ) {
    super(message);
  }
}

/**
 * Turns the workspace into JavaScript using Blockly's generator. Every statement
 * is prefixed with highlightBlock('<id>') so each trace step knows its block, and
 * every loop calls loopTrap() so infinite loops can be stopped.
 */
export function generateCode(workspace: Blockly.Workspace): string {
  Object.assign(javascriptGenerator.forBlock, moveGeneration);

  const previousPrefix = javascriptGenerator.STATEMENT_PREFIX;
  const previousTrap = javascriptGenerator.INFINITE_LOOP_TRAP;
  javascriptGenerator.STATEMENT_PREFIX = 'highlightBlock(%1);\n';
  javascriptGenerator.INFINITE_LOOP_TRAP = 'loopTrap();\n';
  try {
    return javascriptGenerator.workspaceToCode(workspace);
  } finally {
    javascriptGenerator.STATEMENT_PREFIX = previousPrefix;
    javascriptGenerator.INFINITE_LOOP_TRAP = previousTrap;
  }
}

/**
 * Runs generated code against the grid without animating anything. Returns the
 * full trace of robot actions plus how the run ended; the frontend plays it back.
 */
export function runCode(code: string, map: GridMap): RunResult {
  let position: Position = { ...map.start };
  let currentBlockId: string | null = null;
  let loopIterations = 0;
  const trace: TraceStep[] = [];

  const finish = (outcome: RunOutcome, message: string): RunResult => ({
    trace,
    outcome,
    message,
    finalPosition: position,
  });

  // The only functions the generated code can call.
  const highlightBlock = (id: string) => {
    currentBlockId = id;
  };

  const loopTrap = () => {
    loopIterations += 1;
    if (loopIterations > MAX_LOOP_ITERATIONS) {
      throw new StopProgram(
        'too_many_steps',
        'Your program kept looping and never finished. Check that every loop can end.',
      );
    }
  };

  const move = (code: number) => {
    const direction = DIRECTIONS[code];
    if (!direction) throw new Error(`Unknown move direction: ${code}`);
    const offset = OFFSETS[direction];
    const target = { x: position.x + offset.x, y: position.y + offset.y };

    if (isBlocked(map, target)) {
      trace.push({ kind: 'bump', blockId: currentBlockId, direction, at: position, target });
      const what = isOutside(map, target) ? 'the edge of the floor' : 'a wall';
      throw new StopProgram('hit_wall', `Bonk! The robot ran into ${what} moving ${direction}.`);
    }

    trace.push({ kind: 'move', blockId: currentBlockId, direction, from: position, to: target });
    position = target;
    if (trace.length > MAX_TRACE_STEPS) {
      throw new StopProgram('too_many_steps', `The robot took more than ${MAX_TRACE_STEPS} steps.`);
    }
  };

  try {
    // Generated code only references the three functions passed in here.
    new Function('highlightBlock', 'loopTrap', 'move', code)(highlightBlock, loopTrap, move);
  } catch (error) {
    if (error instanceof StopProgram) return finish(error.outcome, error.message);
    const detail = error instanceof Error ? error.message : String(error);
    return finish('runtime_error', `Something went wrong while running your code: ${detail}`);
  }

  if (samePosition(position, map.goal)) return finish('reached_goal', 'You reached the goal!');
  return finish('stopped_short', "Your program finished, but the robot isn't on the goal yet.");
}

/** Generate and run in one call. */
export function runWorkspace(workspace: Blockly.Workspace, map: GridMap): RunResult {
  return runCode(generateCode(workspace), map);
}

export function samePosition(a: Position, b: Position): boolean {
  return a.x === b.x && a.y === b.y;
}

function isOutside(map: GridMap, pos: Position): boolean {
  return pos.x < 0 || pos.y < 0 || pos.x >= map.width || pos.y >= map.height;
}

function isBlocked(map: GridMap, pos: Position): boolean {
  return isOutside(map, pos) || map.walls.some((wall) => samePosition(wall, pos));
}
