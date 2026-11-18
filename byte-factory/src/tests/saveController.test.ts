import {describe, it, expect, beforeEach, afterEach, vi} from 'vitest';
import * as Blockly from 'blockly/core';
import type {Level} from '../levels/types';
import {SaveController} from '../saves/saveController';
import {save, load} from '../saves/serialization';

const makeLevel = (id: string, startState?: object): Level =>
  ({id, startState}) as Level;

beforeEach(() => {
  vi.useFakeTimers();

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
    },
  });
});

afterEach(() => {
  vi.useRealTimers();
});

const createStartState = (): object => {
  const temp = new Blockly.Workspace();
  temp.newBlock('test_move');
  return Blockly.serialization.workspaces.save(temp);
};

describe('SaveController', () => {
  it('auto-saves to localStorage and invokes callback when blocks change', () => {
    const ws = new Blockly.Workspace();
    const onChanged = vi.fn();
    const level = makeLevel('sequencing');

    new SaveController(ws, level, onChanged);

    ws.newBlock('test_move');
    vi.runAllTimers(); // Flush Blockly's async event queue

    expect(onChanged).toHaveBeenCalled();

    const verifyWs = new Blockly.Workspace();
    expect(load(verifyWs, 'sequencing')).toBe(true);
    expect(verifyWs.getAllBlocks(false)).toHaveLength(1);
  });

  it('loads level.startState when no saved progress exists', () => {
    const ws = new Blockly.Workspace();
    const onChanged = vi.fn();
    const level = makeLevel('starter_level', createStartState());

    const controller = new SaveController(ws, level, onChanged);
    controller.loadLevel(level);
    vi.runAllTimers();

    expect(ws.getAllBlocks(false)).toHaveLength(1);
    expect(onChanged).toHaveBeenCalledOnce();
  });

  it('prefers saved progress over level.startState when a save exists', () => {
    const savedWs = new Blockly.Workspace();
    savedWs.newBlock('test_move');
    savedWs.newBlock('test_move');
    save(savedWs, 'level_with_save');

    const level = makeLevel('level_with_save', createStartState());

    const ws = new Blockly.Workspace();
    const controller = new SaveController(ws, level, vi.fn());
    controller.loadLevel(level);
    vi.runAllTimers();

    expect(ws.getAllBlocks(false)).toHaveLength(2);
  });

  it('does not overwrite the new level save with empty blocks during loadLevel()', () => {
    const level2Ws = new Blockly.Workspace();
    level2Ws.newBlock('test_move');
    level2Ws.newBlock('test_move');
    save(level2Ws, 'level_2');

    const ws = new Blockly.Workspace();
    const controller = new SaveController(ws, makeLevel('level_1'), vi.fn());
    ws.newBlock('test_move');
    vi.runAllTimers();

    controller.loadLevel(makeLevel('level_2'));
    vi.runAllTimers();

    expect(ws.getAllBlocks(false)).toHaveLength(2);
  });

  it('resetBlocks() clears saved progress and restores level.startState', () => {
    const level = makeLevel('resettable', createStartState());

    const ws = new Blockly.Workspace();
    const controller = new SaveController(ws, level, vi.fn());
    controller.loadLevel(level);
    vi.runAllTimers();

    ws.newBlock('test_move');
    vi.runAllTimers();
    expect(ws.getAllBlocks(false)).toHaveLength(2);

    controller.resetBlocks();
    vi.runAllTimers();
    expect(ws.getAllBlocks(false)).toHaveLength(1);

    const verifyWs = new Blockly.Workspace();
    load(verifyWs, 'resettable');
    expect(verifyWs.getAllBlocks(false)).toHaveLength(1);
  });
});