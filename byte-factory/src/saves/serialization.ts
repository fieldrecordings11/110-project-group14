/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as Blockly from 'blockly/core';

const storageKey = (levelId: string) => `mainWorkspace_${levelId}`;

/**
 * Saves the current Blockly workspace state for a specific level to localStorage.
 */
export const save = (workspace: Blockly.Workspace, levelId: string): void => {
  try {
    const data = Blockly.serialization.workspaces.save(workspace);
    window.localStorage?.setItem(storageKey(levelId), JSON.stringify(data));
  } catch (err) {
    console.error(`Failed to save level ${levelId}:`, err);
  }
};

/**
 * Loads a saved workspace state for a specific level from localStorage.
 * @returns true if a save existed and was loaded; false if no save was found or parsing failed.
 */
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

/**
 * Removes the saved workspace state for a specific level from localStorage.
 */
export const clearSave = (levelId: string): void => {
  window.localStorage?.removeItem(storageKey(levelId));
};