import { describe, it, expect, beforeAll } from 'vitest';
import * as Blockly from 'blockly/core';
import { javascriptGenerator } from 'blockly/javascript';
import '../blocks/movement';
import { forBlock } from '../generators/moveGeneration';

// move(n) codes the interpreter relies on: 0 = up, 1 = down, 2 = right, 3 = left.
const MOVES: [string, string][] = [
  ['move_up', 'move(0);'],
  ['move_down', 'move(1);'],
  ['move_right', 'move(2);'],
  ['move_left', 'move(3);'],
];

describe('movement blocks', () => {
  beforeAll(() => {
    Object.assign(javascriptGenerator.forBlock, forBlock);
  });

  it.each(MOVES)('%s is registered with Blockly', (type) => {
    expect(Blockly.Blocks[type]).toBeDefined();
  });

  it.each(MOVES)('%s generates %s', (type, code) => {
    const workspace = new Blockly.Workspace();
    workspace.newBlock(type);
    expect(javascriptGenerator.workspaceToCode(workspace).trim()).toBe(code);
    workspace.dispose();
  });

  it('chains stacked blocks in order', () => {
    const workspace = new Blockly.Workspace();
    const right = workspace.newBlock('move_right');
    const down = workspace.newBlock('move_down');
    right.nextConnection!.connect(down.previousConnection!);
    expect(javascriptGenerator.workspaceToCode(workspace)).toBe('move(2);\nmove(1);\n');
    workspace.dispose();
  });
});
