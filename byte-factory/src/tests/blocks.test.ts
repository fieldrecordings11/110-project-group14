import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as Blockly from 'blockly/core';

// Import your block definitions so they register with Blockly
import '../blocks/actions';
import '../blocks/movement';
import '../blocks/sensors';

describe('Block Definitions', () => {
  let workspace: Blockly.Workspace;

  beforeEach(() => {
    workspace = new Blockly.Workspace();
  });

  afterEach(() => {
    workspace.dispose();
  });

  describe('Action Blocks', () => {
    const actionTypes = ['pick_up', 'put_down', 'toggle'];

    actionTypes.forEach((type) => {
      it(`should have previous and next connections for ${type}`, () => {
        const block = workspace.newBlock(type);
        
        // Action blocks should stack vertically
        expect(block.previousConnection).not.toBeNull();
        expect(block.nextConnection).not.toBeNull();
        
        // Action blocks should NOT have a puzzle tab output
        expect(block.outputConnection).toBeNull();
      });
    });
  });

  describe('Movement Blocks', () => {
    const movementTypes = ['move_up', 'move_down', 'move_right', 'move_left'];

    movementTypes.forEach((type) => {
      it(`should have previous and next connections for ${type}`, () => {
        const block = workspace.newBlock(type);
        
        expect(block.previousConnection).not.toBeNull();
        expect(block.nextConnection).not.toBeNull();
        expect(block.outputConnection).toBeNull();
      });
    });
  });

  describe('Sensor Blocks', () => {
    const sensorTypes = [
      'path_clear_right',
      'path_clear_left',
      'path_clear_up',
      'path_clear_down',
      'is_holding_item',
      'on_finish_grid'
    ];

    sensorTypes.forEach((type) => {
      it(`should have an output connection but no statement connections for ${type}`, () => {
        const block = workspace.newBlock(type);
        
        // Sensor blocks should have a puzzle tab to plug into Logic/Loop blocks
        expect(block.outputConnection).not.toBeNull();
        
        // Sensor blocks should NOT stack vertically
        expect(block.previousConnection).toBeNull();
        expect(block.nextConnection).toBeNull();
      });
    });
  });
});