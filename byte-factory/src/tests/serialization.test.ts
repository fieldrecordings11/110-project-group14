import {describe, it, expect, beforeEach, vi} from 'vitest';
import * as Blockly from 'blockly/core';
import {save, load, clearSave} from '../saves/serialization';

beforeEach(() => {
  if (!Blockly.Blocks['test_move']) {
    Blockly.Blocks['test_move'] = {
      init() {
        this.appendDummyInput().appendField('move');
        this.setPreviousStatement(true);
        this.setNextStatement(true);
      },
    };
  }

  const store = new Map<string, string>();
  vi.stubGlobal('window', {
    localStorage: {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => store.set(key, value),
      removeItem: (key: string) => store.delete(key),
      clear: () => store.clear(),
    },
  });
});

describe('serialization', () => {
  it('saves and loads blocks isolated per levelId', () => {
    const ws1 = new Blockly.Workspace();
    ws1.newBlock('test_move');
    save(ws1, 'level_1');

    const ws2 = new Blockly.Workspace();
    save(ws2, 'level_2'); // empty workspace

    // Load level_1 into a fresh workspace
    const target = new Blockly.Workspace();
    const loaded1 = load(target, 'level_1');
    expect(loaded1).toBe(true);
    expect(target.getAllBlocks(false)).toHaveLength(1);
    expect(target.getAllBlocks(false)[0].type).toBe('test_move');

    // Load level_2 into target -> should overwrite with 0 blocks
    const loaded2 = load(target, 'level_2');
    expect(loaded2).toBe(true);
    expect(target.getAllBlocks(false)).toHaveLength(0);
  });

  it('returns false without clearing existing blocks when no save exists', () => {
    const ws = new Blockly.Workspace();
    ws.newBlock('test_move');

    const loaded = load(ws, 'nonexistent_level');
    expect(loaded).toBe(false);
    expect(ws.getAllBlocks(false)).toHaveLength(1);
  });

  it('returns false gracefully when localStorage contains corrupted JSON', () => {
    window.localStorage.setItem('mainWorkspace_broken', '{not valid json');
    const ws = new Blockly.Workspace();

    const loaded = load(ws, 'broken');
    expect(loaded).toBe(false);
  });

  it('clears only the specified level save with clearSave()', () => {
    const ws = new Blockly.Workspace();
    ws.newBlock('test_move');

    save(ws, 'level_1');
    save(ws, 'level_2');

    clearSave('level_1');

    const checkWs = new Blockly.Workspace();
    expect(load(checkWs, 'level_1')).toBe(false);
    expect(load(checkWs, 'level_2')).toBe(true);
  });
});