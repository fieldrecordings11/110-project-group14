import * as Blockly from 'blockly/core';
import type {Level} from '../levels/types';
import {save, load, clearSave} from './serialization';
import {
  exportWorkspaceToFile,
  importWorkspaceFromFile,
  ImportResult,
} from './saveFile';

export class SaveController {
  private activeLevel: Level;
  private isLoading = false;

  constructor(
    private readonly workspace: Blockly.Workspace,
    initialLevel: Level,
    private readonly onWorkspaceChanged: () => void,
  ) {
    this.activeLevel = initialLevel;
    this.bindAutoSave();
  }

  get currentLevel(): Level {
    return this.activeLevel;
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
      save(this.workspace, this.activeLevel.id);
    });
  }

  loadLevel(level: Level, useSaved = true): void {
    this.isLoading = true;
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
      this.isLoading = false;
    }
  }

  resetBlocks(): void {
    clearSave(this.activeLevel.id);
    this.loadLevel(this.activeLevel, false);
    save(this.workspace, this.activeLevel.id);
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
        this.onWorkspaceChanged();
      }
      return result;
    } finally {
      this.isLoading = false;
    }
  }
}