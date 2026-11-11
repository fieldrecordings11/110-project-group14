import * as Blockly from 'blockly/core';
import { javascriptGenerator } from 'blockly/javascript';
import { forBlock as moveGeneration } from '../generators/moveGeneration';
import { actionBlock as actionGeneration } from '../generators/actionGeneration';
import { sensorBlock as sensorGeneration } from '../generators/sensorGeneration';
import { Direction, GridMap, Position, RunOutcome, RunResult, TraceStep } from './types';

// The generators emit move(n), jump(n), checkClear(n) and checkPuddle(n); this is the meaning of n.
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
  Object.assign(javascriptGenerator.forBlock, moveGeneration, actionGeneration, sensorGeneration);

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

  /** Records a bump into target and stops the program. */
  const bumpInto = (direction: Direction, target: Position, outcome: RunOutcome, message: string): never => {
    trace.push({ kind: 'bump', blockId: currentBlockId, direction, at: position, target });
    throw new StopProgram(outcome, message);
  };

  /** Stops the program if the robot can't stand on target. */
  const checkLanding = (direction: Direction, target: Position) => {
    if (isBlocked(map, target)) {
      bumpInto(direction, target, 'hit_wall', `Bonk! The robot ran into ${describeBlocked(map, target)} moving ${direction}.`);
    }
    if (isPuddle(map, target)) {
      bumpInto(direction, target, 'hit_puddle', `Splash! The robot stepped in a puddle moving ${direction}. Try jumping over it.`);
    }
  };

  const recordStep = (kind: 'move' | 'jump', direction: Direction, to: Position) => {
    trace.push({ kind, blockId: currentBlockId, direction, from: position, to });
    position = to;
    if (trace.length > MAX_TRACE_STEPS) {
      throw new StopProgram('too_many_steps', `The robot took more than ${MAX_TRACE_STEPS} steps.`);
    }
  };

  const move = (code: number) => {
    const direction = toDirection(code);
    const target = offsetBy(position, direction, 1);
    checkLanding(direction, target);
    recordStep('move', direction, target);
  };

  /** Moves two tiles, over a puddle or plain floor. Walls can't be jumped over. */
  const jump = (code: number) => {
    const direction = toDirection(code);
    const over = offsetBy(position, direction, 1);
    if (isBlocked(map, over)) {
      bumpInto(direction, over, 'hit_wall', `Bonk! The robot can't jump over ${describeBlocked(map, over)}.`);
    }
    const target = offsetBy(position, direction, 2);
    checkLanding(direction, target);
    recordStep('jump', direction, target);
  };

  // Sensors: answer questions about the tile next to the robot. They don't add trace steps.
  const checkClear = (code: number) => {
    const next = offsetBy(position, toDirection(code), 1);
    return !isBlocked(map, next) && !isPuddle(map, next);
  };
  const checkPuddle = (code: number) => isPuddle(map, offsetBy(position, toDirection(code), 1));
  const checkFinish = () => samePosition(position, map.goal);

  // The only functions the generated code can call.
  const api = { highlightBlock, loopTrap, move, jump, checkClear, checkPuddle, checkFinish };

  const names = Object.keys(api) as (keyof typeof api)[];

  try {
    new Function(...names, code)(...names.map((name) => api[name]));
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

function toDirection(code: number): Direction {
  const direction = DIRECTIONS[code];
  if (!direction) throw new Error(`Unknown direction: ${code}`);
  return direction;
}

function offsetBy(pos: Position, direction: Direction, tiles: number): Position {
  const offset = OFFSETS[direction];
  return { x: pos.x + offset.x * tiles, y: pos.y + offset.y * tiles };
}

function isOutside(map: GridMap, pos: Position): boolean {
  return pos.x < 0 || pos.y < 0 || pos.x >= map.width || pos.y >= map.height;
}

function isBlocked(map: GridMap, pos: Position): boolean {
  return isOutside(map, pos) || map.walls.some((wall) => samePosition(wall, pos));
}

function isPuddle(map: GridMap, pos: Position): boolean {
  return (map.puddles ?? []).some((puddle) => samePosition(puddle, pos));
}

function describeBlocked(map: GridMap, pos: Position): string {
  return isOutside(map, pos) ? 'the edge of the floor' : 'a wall';
}
