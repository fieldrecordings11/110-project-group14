import {describe, it, expect, beforeEach, vi} from 'vitest';
import * as Blockly from 'blockly/core';
import {
  exportWorkspaceToFile,
  importWorkspaceFromFile,
  SaveFilePayload,
} from '../saves/saveFile';
import {load} from '../saves/serialization';

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
    },
  });
});

// Helper to create a File-like object with .text() for Node environments
const makeJsonFile = (content: unknown, name = 'save.json'): File => {
  const raw = typeof content === 'string' ? content : JSON.stringify(content);
  return {
    name,
    text: async () => raw,
  } as unknown as File;
};

describe('saveFile', () => {
  it('exports workspace state with metadata and triggers a download', () => {
    const ws = new Blockly.Workspace();
    ws.newBlock('test_move');

    const clickSpy = vi.fn();
    const fakeLink = {href: '', download: '', click: clickSpy};

    vi.stubGlobal('document', {
      createElement: vi.fn(() => fakeLink),
    });
    vi.stubGlobal('URL', {
      createObjectURL: vi.fn(() => 'blob:mock-url'),
      revokeObjectURL: vi.fn(),
    });

    exportWorkspaceToFile(ws, 'conditionals');

    expect(fakeLink.download).toBe('blockly-conditionals-save.json');
    expect(clickSpy).toHaveBeenCalledOnce();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
  });

  it('imports a valid save file into the workspace and persists it to localStorage', async () => {
    const sourceWs = new Blockly.Workspace();
    sourceWs.newBlock('test_move');

    const payload: SaveFilePayload = {
      version: 1,
      levelId: 'loops',
      exportedAt: new Date().toISOString(),
      workspace: Blockly.serialization.workspaces.save(sourceWs),
    };

    const targetWs = new Blockly.Workspace();
    const result = await importWorkspaceFromFile(
      makeJsonFile(payload),
      targetWs,
      'loops',
    );

    expect(result).toEqual({ok: true});
    expect(targetWs.getAllBlocks(false)).toHaveLength(1);

    // Verify it also saved to localStorage
    const reloadWs = new Blockly.Workspace();
    expect(load(reloadWs, 'loops')).toBe(true);
    expect(reloadWs.getAllBlocks(false)).toHaveLength(1);
  });

  it('returns saveFailed when blocks import into workspace but localStorage fails', async () => {
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

    const targetWs = new Blockly.Workspace();
    const result = await importWorkspaceFromFile(
      makeJsonFile(payload),
      targetWs,
      'loops',
    );

    expect(targetWs.getAllBlocks(false)).toHaveLength(1);
    expect(result).toEqual({
      ok: false,
      saveFailed: true,
      message:
        'Blocks loaded, but progress failed to save: Browser storage is full. Your progress could not be saved locally.',
    });
  });

  it('rejects a save file meant for a different level', async () => {
    const payload: SaveFilePayload = {
      version: 1,
      levelId: 'conditionals',
      exportedAt: new Date().toISOString(),
      workspace: {},
    };

    const ws = new Blockly.Workspace();
    const result = await importWorkspaceFromFile(
      makeJsonFile(payload),
      ws,
      'sequencing',
    );

    expect(result).toEqual({
      ok: false,
      message: 'Save file is for level "conditionals", not "sequencing".',
    });
  });

  it('rejects files with invalid schema or malformed JSON', async () => {
    const ws = new Blockly.Workspace();

    const wrongVersion = await importWorkspaceFromFile(
      makeJsonFile({version: 99, levelId: 'loops', workspace: {}}),
      ws,
      'loops',
    );
    expect(wrongVersion).toEqual({
      ok: false,
      message: 'Invalid save file format.',
    });

    const badJson = await importWorkspaceFromFile(
      makeJsonFile('{corrupted'),
      ws,
      'loops',
    );
    expect(badJson).toEqual({
      ok: false,
      message: 'Could not parse JSON save file.',
    });
  });
});