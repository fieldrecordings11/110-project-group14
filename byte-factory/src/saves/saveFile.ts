import * as Blockly from 'blockly/core';
import {save} from './serialization';

const SAVE_SCHEMA_VERSION = 1;

export interface SaveFilePayload {
  version: number;
  levelId: string;
  exportedAt: string;
  workspace: Record<string, unknown>;
}

export type ImportResult =
  | {ok: true}
  | {ok: false; message: string};

/**
 * Serializes the workspace and level metadata into a downloadable .json file.
 */
export const exportWorkspaceToFile = (
  workspace: Blockly.Workspace,
  levelId: string,
): void => {
  const payload: SaveFilePayload = {
    version: SAVE_SCHEMA_VERSION,
    levelId,
    exportedAt: new Date().toISOString(),
    workspace: Blockly.serialization.workspaces.save(workspace),
  };

  const json = JSON.stringify(payload, null, 2);
  const blob = new Blob([json], {type: 'application/json'});
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `blockly-${levelId}-save.json`;
  link.click();

  URL.revokeObjectURL(url);
};

/**
 * Reads an uploaded .json save file, validates its schema and levelId,
 * loads it into the workspace, and persists it to localStorage.
 */
export const importWorkspaceFromFile = async (
  file: File,
  workspace: Blockly.Workspace,
  expectedLevelId: string,
): Promise<ImportResult> => {
  try {
    const text = await file.text();
    const parsed = JSON.parse(text) as Partial<SaveFilePayload>;

    if (
      parsed.version !== SAVE_SCHEMA_VERSION ||
      typeof parsed.levelId !== 'string' ||
      !parsed.workspace ||
      typeof parsed.workspace !== 'object'
    ) {
      return {ok: false, message: 'Invalid save file format.'};
    }

    if (parsed.levelId !== expectedLevelId) {
      return {
        ok: false,
        message: `Save file is for level "${parsed.levelId}", not "${expectedLevelId}".`,
      };
    }

    Blockly.serialization.workspaces.load(parsed.workspace, workspace);
    workspace.clearUndo();
    save(workspace, expectedLevelId);
    return {ok: true};
  } catch (err) {
    console.error('Failed to import save file:', err);
    return {ok: false, message: 'Could not parse JSON save file.'};
  }
};