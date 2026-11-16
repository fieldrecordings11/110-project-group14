import * as Blockly from 'blockly/core';

const storageKey = (levelId: string) => `mainWorkspace_${levelId}`;

export const save = (workspace: Blockly.Workspace, levelId: string): void => {
  try {
    const data = Blockly.serialization.workspaces.save(workspace);
    window.localStorage?.setItem(storageKey(levelId), JSON.stringify(data));
  } catch (err) {
    console.error(`Failed to save level ${levelId}:`, err);
  }
};

export const load = (workspace: Blockly.Workspace, levelId: string): boolean => {
  const raw = window.localStorage?.getItem(storageKey(levelId));
  if (!raw) {
    return false;
  }

  try {
    const state = JSON.parse(raw);
    Blockly.serialization.workspaces.load(state, workspace);
    workspace.clearUndo();
    return true;
  } catch (err) {
    console.error(`Failed to load level ${levelId}:`, err);
    return false;
  }
};

export const clearSave = (levelId: string): void => {
  window.localStorage?.removeItem(storageKey(levelId));
};