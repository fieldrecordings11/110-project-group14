/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as Blockly from 'blockly/core';

const storageKey = (levelId: string) => `mainWorkspace_${levelId}`;

export type SaveResult =
  | {ok: true}
  | {ok: false; message: string};

const formatSaveError = (err: unknown): string => {
  if (err instanceof DOMException) {
    if (err.name === 'QuotaExceededError' || err.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
      return 'Browser storage is full. Your progress could not be saved locally.';
    }
    if (err.name === 'SecurityError') {
      return 'Browser storage is blocked (e.g. private browsing or disabled cookies).';
    }
  }
  return 'An unexpected error prevented your level progress from saving.';
};

/**
 * Saves the current Blockly workspace state for a specific level to localStorage.
 */
export const save = (workspace: Blockly.Workspace, levelId: string): SaveResult => {
  try {
    if (!window.localStorage) {
      return {
        ok: false,
        message: 'Local storage is unavailable in this browser.',
      };
    }
    const data = Blockly.serialization.workspaces.save(workspace);
    window.localStorage.setItem(storageKey(levelId), JSON.stringify(data));
    return {ok: true};
  } catch (err) {
    console.error(`Failed to save level ${levelId}:`, err);
    return {ok: false, message: formatSaveError(err)};
  }
};

/**
 * Loads a saved workspace state for a specific level from localStorage.
 * @returns true if a save existed and was loaded; false if no save was found or parsing failed.
 */
export const load = (workspace: Blockly.Workspace, levelId: string): boolean => {
  try {
    const raw = window.localStorage?.getItem(storageKey(levelId));
    if (!raw) {
      return false;
    }

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
  try {
    window.localStorage?.removeItem(storageKey(levelId));
  } catch (err) {
    console.error(`Failed to clear save for level ${levelId}:`, err);
  }
};