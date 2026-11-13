import { describe, it, expect } from 'vitest';
import { levels } from '../levels/data';
import { toolbox, toolboxFor } from '../toolbox';

/** Every block type a toolbox offers, in order. */
function blockTypes(box: ReturnType<typeof toolboxFor>): string[] {
  return box.contents.reduce<string[]>((types, category) => types.concat(category.contents.map((item) => item.type)), []);
}

describe('toolboxFor', () => {
  it('keeps only the allowed blocks and drops empty categories', () => {
    const box = toolboxFor(['move_right', 'controls_whileUntil']);
    expect(box.contents.map((category) => category.name)).toEqual(['Movement', 'Loops']);
    expect(blockTypes(box)).toEqual(['move_right', 'controls_whileUntil']);
  });

  it('leaves the full toolbox unchanged', () => {
    const before = JSON.stringify(toolbox);
    toolboxFor(['move_right']);
    expect(JSON.stringify(toolbox)).toBe(before);
  });

  it.each(levels.map((level) => [level.id, level]))('offers every block level %s allows', (_id, level) => {
    expect(new Set(blockTypes(toolboxFor(level.allowedBlocks)))).toEqual(new Set(level.allowedBlocks));
  });
});
