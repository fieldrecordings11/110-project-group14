/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as Blockly from 'blockly/core';

const storageKey = (levelId: string) => 'mainWorkspace_${levelId}';

/**
 * Saves the state of the workspace to browser's local storage.
 * @param workspace Blockly workspace to save.
 */
export const save = function (workspace: Blockly.Workspace, levelId: string) {
  const data = Blockly.serialization.workspaces.save(workspace);
  window.localStorage?.setItem(storageKey(levelId), JSON.stringify(data));
};

/**
 * Loads saved state from local storage into the given workspace.
 * @param workspace Blockly workspace to load into.
 */
export const load = function (workspace: Blockly.Workspace, levelId: string) {
  const data = window.localStorage?.getItem(storageKey(levelId));
  if (!data) {
    workspace.clear();
    return;
  }

  // Don't emit events during loading.
  Blockly.Events.disable();
  try {
    const parse = JSON.parse(data);
    Blockly.serialization.workspaces.load(JSON.parse(data), workspace, undefined);
  } catch (err) {
    console.error(`Failed to load level ${levelId}: `, err);
    workspace.clear();
  } finally {
    Blockly.Events.enable();
  }
};
