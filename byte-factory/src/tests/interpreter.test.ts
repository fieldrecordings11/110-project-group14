import { describe, it, expect } from 'vitest';
import { MAX_LOOP_ITERATIONS, generateCode, runCode, runWorkspace } from '../interpreter/interpreter';
import { GridMap } from '../interpreter/types';
import { repeat, stack, workspaceWith } from './helpers';

// 4x3 floor, robot top-left, goal bottom-right, one wall in the middle.
const map: GridMap = {
  width: 4,
  height: 3,
  start: { x: 0, y: 0 },
  goal: { x: 3, y: 2 },
  walls: [{ x: 1, y: 1 }],
};

describe('generateCode', () => {
  it('tags each statement with its block id and leaves the generator as it was', () => {
    const ws = workspaceWith(stack('move_right'));
    const blockId = ws.getAllBlocks(false)[0].id;
    const code = generateCode(ws);
    expect(code).toContain(`highlightBlock('${blockId}')`);
    expect(code).toContain('move(2);');

    // A second, plain generation must not carry the interpreter's hooks.
    expect(generateCode(ws)).toBe(code);
  });
});

describe('runWorkspace', () => {
  it('records every move and reaches the goal', () => {
    const ws = workspaceWith(stack('move_right', 'move_right', 'move_right', 'move_down', 'move_down'));
    const result = runWorkspace(ws, map);

    expect(result.outcome).toBe('reached_goal');
    expect(result.finalPosition).toEqual({ x: 3, y: 2 });
    expect(result.trace.map((s) => s.kind === 'move' && s.direction)).toEqual([
      'right',
      'right',
      'right',
      'down',
      'down',
    ]);
    expect(result.trace[0]).toMatchObject({ from: { x: 0, y: 0 }, to: { x: 1, y: 0 } });
  });

  it('links each trace step to the block that produced it', () => {
    const ws = workspaceWith(stack('move_right', 'move_down'));
    const ids = ws.getTopBlocks(true)[0].getDescendants(true).map((b) => b.id);
    const result = runWorkspace(ws, map);
    expect(result.trace.map((s) => s.blockId)).toEqual(ids);
  });

  it('runs repeat loops', () => {
    const ws = workspaceWith(stack(repeat(3, stack('move_right')), repeat(2, stack('move_down'))));
    const result = runWorkspace(ws, map);
    expect(result.trace).toHaveLength(5);
    expect(result.outcome).toBe('reached_goal');
  });

  it('stops with a bump when the robot hits a wall', () => {
    const ws = workspaceWith(stack('move_right', 'move_down', 'move_right'));
    const result = runWorkspace(ws, map);
    expect(result.outcome).toBe('hit_wall');
    expect(result.trace[result.trace.length - 1]).toMatchObject({ kind: 'bump', direction: 'down', at: { x: 1, y: 0 } });
    expect(result.trace).toHaveLength(2); // the move after the bump never runs
    expect(result.message).toContain('a wall');
  });

  it('stops with a bump at the edge of the floor', () => {
    const result = runWorkspace(workspaceWith(stack('move_up')), map);
    expect(result.outcome).toBe('hit_wall');
    expect(result.message).toContain('edge');
    expect(result.finalPosition).toEqual(map.start);
  });

  it('reports a program that ends before the goal', () => {
    const result = runWorkspace(workspaceWith(stack('move_right')), map);
    expect(result.outcome).toBe('stopped_short');
    expect(result.finalPosition).toEqual({ x: 1, y: 0 });
  });

  it('stops an infinite loop instead of hanging', () => {
    const forever = {
      type: 'controls_whileUntil',
      fields: { MODE: 'WHILE' },
      inputs: { BOOL: { block: { type: 'logic_boolean', fields: { BOOL: 'TRUE' } } } },
    };
    const result = runWorkspace(workspaceWith(forever), map);
    expect(result.outcome).toBe('too_many_steps');
    expect(result.trace).toHaveLength(0);
  });

  it('caps the number of loop iterations', () => {
    const result = runWorkspace(workspaceWith(repeat(MAX_LOOP_ITERATIONS + 1, stack('move_right', 'move_left'))), {
      ...map,
      walls: [],
    });
    expect(result.outcome).toBe('too_many_steps');
  });

  it('does nothing for an empty workspace', () => {
    const result = runWorkspace(workspaceWith(), map);
    expect(result.trace).toEqual([]);
    expect(result.outcome).toBe('stopped_short');
  });
});

describe('runCode', () => {
  it('turns unexpected errors into a runtime_error result', () => {
    const result = runCode('move(9);', map);
    expect(result.outcome).toBe('runtime_error');
    expect(result.message).toContain('Unknown move direction');
  });
});
