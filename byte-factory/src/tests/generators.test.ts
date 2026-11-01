import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as Blockly from 'blockly/core';
import { javascriptGenerator } from 'blockly/javascript';

// Import your block definitions (assuming these files call Blockly.defineBlocksWithJsonArray)
import '../blocks/actions';
import '../blocks/movement';
import '../blocks/sensors';

// Import your generators
import { actionBlock } from '../generators/actionGeneration';
import { moveBlock } from '../generators/moveGeneration';
import { sensorBlock } from '../generators/sensorGeneration';

// Register generators for tests
Object.assign(javascriptGenerator.forBlock, actionBlock);
Object.assign(javascriptGenerator.forBlock, moveBlock);
Object.assign(javascriptGenerator.forBlock, sensorBlock);

describe('Blockly Code Generation', () => {
  let workspace: Blockly.Workspace;

  beforeEach(() => {
    // Create a headless workspace before each test
    workspace = new Blockly.Workspace();
  });

  afterEach(() => {
    // Clean up to prevent memory leaks
    workspace.dispose();
  });

  describe('Action Blocks', () => {
    it('should generate correct code for pick_up', () => {
      const block = workspace.newBlock('pick_up');
      const code = javascriptGenerator.blockToCode(block);
      expect(code).toBe('pickUp();\n');
    });

    it('should generate correct code for put_down', () => {
      const block = workspace.newBlock('put_down');
      const code = javascriptGenerator.blockToCode(block);
      expect(code).toBe('putDown();\n');
    });

    it('should generate correct code for toggle', () => {
      const block = workspace.newBlock('toggle');
      const code = javascriptGenerator.blockToCode(block);
      expect(code).toBe('toggleSwitch();\n');
    });
  });

  describe('Movement Blocks', () => {
    it('should generate correct code for move_up', () => {
      const block = workspace.newBlock('move_up');
      const code = javascriptGenerator.blockToCode(block);
      expect(code).toBe('move(0);\n');
    });

    it('should generate correct code for move_down', () => {
      const block = workspace.newBlock('move_down');
      const code = javascriptGenerator.blockToCode(block);
      expect(code).toBe('move(1);\n');
    });

    it('should generate correct code for move_right', () => {
      const block = workspace.newBlock('move_right');
      const code = javascriptGenerator.blockToCode(block);
      expect(code).toBe('move(2);\n');
    });

    it('should generate correct code for move_left', () => {
      const block = workspace.newBlock('move_left');
      const code = javascriptGenerator.blockToCode(block);
      expect(code).toBe('move(3);\n');
    });
  });

  describe('Sensor Blocks', () => {
    it('should generate correct code for path_clear_up', () => {
      const block = workspace.newBlock('path_clear_up');
      const codeTuple = javascriptGenerator.blockToCode(block) as [string, number];
      expect(codeTuple[0]).toBe('checkClear(0)');
    });

    it('should generate correct code for path_clear_down', () => {
      const block = workspace.newBlock('path_clear_down');
      const codeTuple = javascriptGenerator.blockToCode(block) as [string, number];
      expect(codeTuple[0]).toBe('checkClear(1)');
    });

    it('should generate correct code for path_clear_right', () => {
      const block = workspace.newBlock('path_clear_right');
      const codeTuple = javascriptGenerator.blockToCode(block) as [string, number];
      expect(codeTuple[0]).toBe('checkClear(2)');
    });

    it('should generate correct code for path_clear_left', () => {
      const block = workspace.newBlock('path_clear_left');
      const codeTuple = javascriptGenerator.blockToCode(block) as [string, number];
      expect(codeTuple[0]).toBe('checkClear(3)');
    });

    it('should generate correct code for is_holding_item', () => {
      const block = workspace.newBlock('is_holding_item');
      const codeTuple = javascriptGenerator.blockToCode(block) as [string, number];
      expect(codeTuple[0]).toBe('checkHolding()');
    });

    it('should generate correct code for on_finish_grid', () => {
      const block = workspace.newBlock('on_finish_grid');
      const codeTuple = javascriptGenerator.blockToCode(block) as [string, number];
      expect(codeTuple[0]).toBe('checkFinish()');
    });
  });
});