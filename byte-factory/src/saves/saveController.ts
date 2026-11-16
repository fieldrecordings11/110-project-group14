import * as Blockly from 'blockly/core';
import {save, load, clearSave} from './serialization';
import {
  exportWorkspaceToFile,
  importWorkspaceFromFile,
  ImportResult,
} from './saveFile';

export interface LevelLike {
  id?: string;
  startState?: object;
}

export class SaveController {
  private activeLevel: LevelLike;
  private isLoading = false;

  constructor(
    private readonly workspace: Blockly.Workspace,
    initialLevel: LevelLike,
    private readonly onWorkspaceChanged: () => void,
  ) {
    this.activeLevel = initialLevel;
    this.bindAutoSave();
  }

  get currentLevel(): LevelLike {
    return this.activeLevel;
  }

  private get levelId(): string {
    return this.activeLevel.id ?? 'demo';
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
      save(this.workspace, this.levelId);
    });
  }

  loadLevel(level: LevelLike, useSaved = true): void {
    this.isLoading = true;
    try {
      if (this.workspace instanceof Blockly.WorkspaceSvg) {
        this.workspace.highlightBlock(null);
      }
      this.workspace.clear();

      const id = level.id ?? 'demo';
      const loadedFromSave = useSaved && load(this.workspace, id);
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
    clearSave(this.levelId);
    this.loadLevel(this.activeLevel, false);
    save(this.workspace, this.levelId);
  }

  exportSave(): string {
    exportWorkspaceToFile(this.workspace, this.levelId);
    return this.levelId;
  }

  async importSave(file: File): Promise<ImportResult> {
    this.isLoading = true;
    try {
      const result = await importWorkspaceFromFile(
        file,
        this.workspace,
        this.levelId,
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