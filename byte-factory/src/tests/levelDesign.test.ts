import { describe, it, expect } from 'vitest';
import { fitTileSize } from '../animation/GridView';
import { runWorkspace } from '../interpreter/interpreter';
import { GridMap } from '../interpreter/types';
import { conditionalsLevel, conditionalsMap } from '../levels/conditionals';
import { wallsExcept } from '../levels/grid';
import { loopsLevel, loopsMap } from '../levels/loops';
import { sequencingLevel, sequencingMap } from '../levels/sequencing';
import { Level } from '../levels/types';
import { Validator } from '../validator/validator';
import { BlockJson, ifElse, repeatUntil, stack, workspaceWith } from './helpers';

const validator = new Validator();

/** Validates a program for a level, then runs it if it's allowed. */
function play(level: Level, map: GridMap, program: BlockJson) {
  const ws = workspaceWith(program);
  const validation = validator.validate(ws, level);
  return { validation, result: validation.ok ? runWorkspace(ws, map) : null };
}

describe('Sequencing level', () => {
  it('is solved by stacking moves in the right order', () => {
    const { validation, result } = play(
      sequencingLevel,
      sequencingMap,
      stack('move_down', 'move_down', 'move_right', 'move_right', 'move_right', 'move_down', 'move_right'),
    );
    expect(validation.ok).toBe(true);
    expect(result?.outcome).toBe('reached_goal');
  });

  it('fails when the same moves run in the wrong order', () => {
    const { result } = play(
      sequencingLevel,
      sequencingMap,
      stack('move_right', 'move_right', 'move_right', 'move_down', 'move_down', 'move_down', 'move_right'),
    );
    expect(result?.outcome).toBe('hit_wall');
  });
});

describe('Loops level', () => {
  const solution = repeatUntil('on_finish_grid', stack('move_right', 'move_down'));

  it('is solved by repeating right, down until the finish', () => {
    const { validation, result } = play(loopsLevel, loopsMap, solution);
    expect(validation.ok).toBe(true);
    expect(result?.outcome).toBe('reached_goal');
    expect(result?.trace).toHaveLength(10);
  });

  it('is too long to solve without a loop', () => {
    const moves = Array.from({ length: 5 }, () => ['move_right', 'move_down']).reduce((a, b) => a.concat(b));
    const { validation } = play(loopsLevel, loopsMap, stack(...moves));
    expect(validation).toMatchObject({ ok: false, reason: 'too_many_blocks' });
  });

  it('only has walls off the staircase', () => {
    expect(loopsMap.walls).not.toContainEqual(loopsMap.start);
    expect(loopsMap.walls).not.toContainEqual(loopsMap.goal);
  });
});

describe('Conditionals level', () => {
  const solution = repeatUntil('on_finish_grid', ifElse('puddle_right', stack('jump_right'), stack('move_right')));

  it('is solved by jumping only when there is a puddle', () => {
    const { validation, result } = play(conditionalsLevel, conditionalsMap, solution);
    expect(validation.ok).toBe(true);
    expect(result?.outcome).toBe('reached_goal');
  });

  it('is too long to hard-code', () => {
    const hardCoded = stack('move_right', 'jump_right', 'jump_right', 'move_right', 'jump_right', 'move_right', 'jump_right');
    const { validation } = play(conditionalsLevel, conditionalsMap, hardCoded);
    expect(validation).toMatchObject({ ok: false, reason: 'too_many_blocks' });
  });

  it.each([
    ['move, jump', stack('move_right', 'jump_right')],
    ['jump, move', stack('jump_right', 'move_right')],
  ])('cannot be solved by a loop without an if (%s)', (_name, body) => {
    const { result } = play(conditionalsLevel, conditionalsMap, repeatUntil('on_finish_grid', body));
    expect(result?.outcome).toBe('hit_puddle');
  });

  it('fits in the level panel', () => {
    expect(fitTileSize(conditionalsMap, 400) * conditionalsMap.width).toBeLessThanOrEqual(400);
  });
});

describe('wallsExcept', () => {
  it('walls off every tile not listed as open', () => {
    expect(wallsExcept(2, 2, [{ x: 0, y: 0 }, { x: 1, y: 1 }])).toEqual([
      { x: 1, y: 0 },
      { x: 0, y: 1 },
    ]);
  });
});

describe('fitTileSize', () => {
  it('keeps the default size for small grids and shrinks wide ones', () => {
    expect(fitTileSize(sequencingMap, 400)).toBe(48);
    expect(fitTileSize({ ...sequencingMap, width: 20 }, 400)).toBe(20);
  });
});
