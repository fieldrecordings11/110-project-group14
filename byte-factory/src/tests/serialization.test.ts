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
    expect(save(ws1, 'level_1')).toEqual({ok: true});

    const ws2 = new Blockly.Workspace();
    expect(save(ws2, 'level_2')).toEqual({ok: true}); // empty workspace

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

  it('returns an error when window.localStorage is undefined', () => {
    vi.stubGlobal('window', {localStorage: undefined});
    const ws = new Blockly.Workspace();
    ws.newBlock('test_move');

    const result = save(ws, 'level_1');
    expect(result).toEqual({
      ok: false,
      message: 'Local storage is unavailable in this browser.',
    });
  });

  it('returns a quota error message when localStorage throws QuotaExceededError', () => {
    vi.spyOn(window.localStorage, 'setItem').mockImplementation(() => {
      throw new DOMException('Storage full', 'QuotaExceededError');
    });

    const ws = new Blockly.Workspace();
    ws.newBlock('test_move');

    const result = save(ws, 'level_1');
    expect(result).toEqual({
      ok: false,
      message: 'Browser storage is full. Your progress could not be saved locally.',
    });
  });

  it('returns a blocked-storage message when localStorage throws SecurityError', () => {
    vi.spyOn(window.localStorage, 'setItem').mockImplementation(() => {
      throw new DOMException('Access denied', 'SecurityError');
    });

    const ws = new Blockly.Workspace();
    ws.newBlock('test_move');

    const result = save(ws, 'level_1');
    expect(result).toEqual({
      ok: false,
      message: 'Browser storage is blocked (e.g. private browsing or disabled cookies).',
    });
  });
});
