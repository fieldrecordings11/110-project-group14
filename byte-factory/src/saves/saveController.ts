import * as Blockly from 'blockly/core';
import type {Level} from '../levels/types';
import {save, load, clearSave, SaveResult} from './serialization';
import {
  exportWorkspaceToFile,
  importWorkspaceFromFile,
  ImportResult,
} from './saveFile';

export class SaveController {
  private activeLevel: Level;
  private isLoading = false;
  private hasNotifiedSaveError = false;

  constructor(
    private readonly workspace: Blockly.Workspace,
    initialLevel: Level,
    private readonly onWorkspaceChanged: () => void,
    private readonly onSaveError?: (message: string) => void,
  ) {
    this.activeLevel = initialLevel;
    this.bindAutoSave();
  }

  get currentLevel(): Level {
    return this.activeLevel;
  }

  /**
   * Persists the workspace and notifies the listener if saving fails.
   * @param forceNotify Re-triggers the error callback even if already notified during auto-save.
   */
  saveNow(forceNotify = false): SaveResult {
    const result = save(this.workspace, this.activeLevel.id);
    if (result.ok) {
      this.hasNotifiedSaveError = false;
    } else if (forceNotify || !this.hasNotifiedSaveError) {
      this.hasNotifiedSaveError = true;
      this.onSaveError?.(result.message);
    }
    return result;
  }

  private bindAutoSave(): void {
    this.workspace.addChangeListener((e: Blockly.Events.Abstract) => {
      const isDragging =
        this.workspace instanceof Blockly.WorkspaceSvg &&
        this.workspace.isDragging();

      if (
        this.isLoading ||
        e.isUiEvent ||
        e.type === Blockly.Events.FINISHED_LOADING ||
        isDragging
      ) {
        return;
      }
      this.onWorkspaceChanged();
      this.saveNow(false);
    });
  }

  loadLevel(level: Level, useSaved = true): void {
    this.isLoading = true;
    this.hasNotifiedSaveError = false;
    Blockly.Events.disable();
    try {
      if (this.workspace instanceof Blockly.WorkspaceSvg) {
        this.workspace.highlightBlock(null);
      }
      this.workspace.clear();

      const loadedFromSave = useSaved && load(this.workspace, level.id);
      if (!loadedFromSave && level.startState) {
        Blockly.serialization.workspaces.load(level.startState, this.workspace);
      }

      this.workspace.clearUndo();
      this.activeLevel = level;
      this.onWorkspaceChanged();
    } finally {
      Blockly.Events.enable();
      this.isLoading = false;
    }
  }

  resetBlocks(): void {
    clearSave(this.activeLevel.id);
    this.loadLevel(this.activeLevel, false);
    this.saveNow(true);
  }

  exportSave(): string {
    exportWorkspaceToFile(this.workspace, this.activeLevel.id);
    return this.activeLevel.id;
  }

  async importSave(file: File): Promise<ImportResult> {
    this.isLoading = true;
    try {
      const result = await importWorkspaceFromFile(
        file,
        this.workspace,
        this.activeLevel.id,
      );
      if (result.ok) {
        this.hasNotifiedSaveError = false;
        this.onWorkspaceChanged();
      } else if (result.saveFailed) {
        this.onWorkspaceChanged();
        this.hasNotifiedSaveError = true;
        this.onSaveError?.(result.message);
      }
      return result;
    } finally {
      this.isLoading = false;
    }
  }
}
