import { describe, it, expect, beforeAll } from 'vitest';
import * as Blockly from 'blockly/core';
import 'blockly/blocks'; // built-in blocks, e.g. 'text'
import { javascriptGenerator } from 'blockly/javascript';
import { blocks } from '../blocks/text';
import { forBlock } from '../generators/javascript';

describe('add_text block', () => {
  beforeAll(() => {
    Blockly.common.defineBlocks(blocks);
    Object.assign(javascriptGenerator.forBlock, forBlock);
  });

  it('is registered with Blockly', () => {
    expect(Blockly.Blocks['add_text']).toBeDefined();
  });

  it('generates a call to addText with the given text', () => {
    const workspace = new Blockly.Workspace();
    const addText = workspace.newBlock('add_text');
    const text = workspace.newBlock('text');
    text.setFieldValue('hello', 'TEXT');
    addText.getInput('TEXT')!.connection!.connect(text.outputConnection!);

    const code = javascriptGenerator.workspaceToCode(workspace);

    expect(code).toContain("addText('hello');");
    workspace.dispose();
  });
});
