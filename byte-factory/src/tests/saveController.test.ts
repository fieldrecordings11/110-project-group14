import {describe, it, expect, beforeEach, afterEach, vi} from 'vitest';
import * as Blockly from 'blockly/core';
import type {Level} from '../levels/types';
import {SaveController} from '../saves/saveController';
import {SaveFilePayload} from '../saves/saveFile';
import {save, load} from '../saves/serialization';

const makeLevel = (id: string, startState?: object): Level =>
  ({id, startState}) as Level;

const makeJsonFile = (content: unknown, name = 'save.json'): File =>
  ({
    name,
    text: async () => JSON.stringify(content),
  }) as unknown as File;

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
  vi.runAllTimers();
  vi.useRealTimers();
  vi.restoreAllMocks();
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

  it('notifies onSaveError once on consecutive auto-save failures and resets after recovery', () => {
    const setItemSpy = vi
      .spyOn(window.localStorage, 'setItem')
      .mockImplementation(() => {
        throw new DOMException('Quota exceeded', 'QuotaExceededError');
      });

    const ws = new Blockly.Workspace();
    const onChanged = vi.fn();
    const onSaveError = vi.fn();
    const controller = new SaveController(
      ws,
      makeLevel('sequencing'),
      onChanged,
      onSaveError,
    );

    // First block change triggers the error callback
    ws.newBlock('test_move');
    vi.runAllTimers();
    expect(onChanged).toHaveBeenCalled();
    expect(onSaveError).toHaveBeenCalledTimes(1);
    expect(onSaveError).toHaveBeenCalledWith(
      'Browser storage is full. Your progress could not be saved locally.',
    );

    // Second block change while still failing should NOT spam onSaveError again
    ws.newBlock('test_move');
    vi.runAllTimers();
    expect(onSaveError).toHaveBeenCalledTimes(1);

    // Explicit retry (forceNotify = true) still notifies if it fails
    expect(controller.saveNow(true).ok).toBe(false);
    expect(onSaveError).toHaveBeenCalledTimes(2);

    // Restore working storage -> saveNow succeeds and clears the error flag
    setItemSpy.mockRestore();
    expect(controller.saveNow(true)).toEqual({ok: true});

    // Future failures will notify again
    vi.spyOn(window.localStorage, 'setItem').mockImplementation(() => {
      throw new DOMException('Quota exceeded', 'QuotaExceededError');
    });
    ws.newBlock('test_move');
    vi.runAllTimers();
    expect(onSaveError).toHaveBeenCalledTimes(3);
  });

  it('notifies onSaveError when resetBlocks() fails to save', () => {
    const ws = new Blockly.Workspace();
    const onSaveError = vi.fn();
    const controller = new SaveController(
      ws,
      makeLevel('resettable', createStartState()),
      vi.fn(),
      onSaveError,
    );

    vi.spyOn(window.localStorage, 'setItem').mockImplementation(() => {
      throw new DOMException('Quota exceeded', 'QuotaExceededError');
    });

    controller.resetBlocks();
    vi.runAllTimers();

    expect(onSaveError).toHaveBeenCalledWith(
      'Browser storage is full. Your progress could not be saved locally.',
    );
  });

  it('notifies onSaveError when importSave() loads blocks but fails to persist them', async () => {
    const sourceWs = new Blockly.Workspace();
    sourceWs.newBlock('test_move');
    const payload: SaveFilePayload = {
      version: 1,
      levelId: 'loops',
      exportedAt: new Date().toISOString(),
      workspace: Blockly.serialization.workspaces.save(sourceWs),
    };

    vi.spyOn(window.localStorage, 'setItem').mockImplementation(() => {
      throw new DOMException('Quota exceeded', 'QuotaExceededError');
    });

    const ws = new Blockly.Workspace();
    const onChanged = vi.fn();
    const onSaveError = vi.fn();
    const controller = new SaveController(
      ws,
      makeLevel('loops'),
      onChanged,
      onSaveError,
    );

    const result = await controller.importSave(makeJsonFile(payload));

    expect(result.ok).toBe(false);
    expect(ws.getAllBlocks(false)).toHaveLength(1);
    expect(onChanged).toHaveBeenCalled();
    expect(onSaveError).toHaveBeenCalledWith(
      'Blocks loaded, but progress failed to save: Browser storage is full. Your progress could not be saved locally.',
    );
  });
});