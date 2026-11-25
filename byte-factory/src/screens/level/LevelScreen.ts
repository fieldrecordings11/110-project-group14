import * as Blockly from 'blockly';
import { javascriptGenerator } from 'blockly/javascript';
import type { Screen } from '../../app/Screen';
import { GridView, fitTileSize } from '../../animation/GridView';
import { TracePlayer } from '../../animation/TracePlayer';
import { forBlock as moveGeneration } from '../../generators/moveGeneration';
import { actionBlock as actionGeneration } from '../../generators/actionGeneration';
import { sensorBlock as sensorGeneration } from '../../generators/sensorGeneration';
import { eventBlock as eventGeneration } from '../../generators/eventGeneration';
import { generateCode, runCode } from '../../interpreter/interpreter';
import { levelRegistry } from '../../levels';
import { LevelLoader } from '../../levels/loader';
import { Level } from '../../levels/types';
import { SaveController } from '../../saves/saveController';
import { toolboxFor } from '../../toolbox';
import { Validator } from '../../validator/validator';
import { gameTheme } from './gameTheme';
import { StartBlockDragger } from './StartBlockDragger';
import '../../blocks/movement';
import '../../blocks/actions';
import '../../blocks/sensors';
import '../../blocks/events';
import './level.css';

// Register the blocks' generators with Blockly
Object.assign(javascriptGenerator.forBlock, moveGeneration);
Object.assign(javascriptGenerator.forBlock, actionGeneration);
Object.assign(javascriptGenerator.forBlock, sensorGeneration);
Object.assign(javascriptGenerator.forBlock, eventGeneration);

export type LevelScreenOptions = {
  level: Level;
  /** Called each time the robot reaches the goal. */
  onComplete: () => void;
  onExit: () => void;
  onContinue?: () => void;
};

const TEMPLATE = `
  <div class="level-screen">
    <header id="gameHeader">
      <div id="levelHeader">
        <button id="backButton" type="button">← Roadmap</button>
        <h1 id="levelTitle"></h1>
      </div>
      <p id="levelInstructions"></p>
      <p id="blockLimit"></p>
    </header>
    <div id="pageContainer">
      <div id="blocklyDiv"></div>
      <div id="outputPanel">
        <div id="gamePreview">
          <div id="gameCanvas"></div>
        </div>
        <div id="controls">
          <button id="runButton" type="button">Run</button>
          <button id="resetButton" type="button">Reset Robot</button>
          <button id="resetBlocksButton" type="button">Reset Blocks</button>
          <button id="exportButton" type="button">Export Save</button>
          <button id="importButton" type="button">Import Save</button>
          <input id="importFileInput" type="file" accept=".json,application/json" hidden />
        </div>
        <p id="status"></p>
        <pre id="generatedCode"><code></code></pre>
      </div>
    </div>

    <dialog id="resultDialog" aria-labelledby="resultTitle">
      <h2 id="resultTitle"></h2>
      <p id="resultMessage"></p>
      <div id="resultActions">
        <button id="replayButton" type="button">Replay</button>
        <button id="keepEditingButton" type="button">Try Again</button>
        <button id="continueButton" type="button" hidden>Next Level</button>
        <button id="resultRoadmapButton" type="button">Return to Roadmap</button>
      </div>
    </dialog>

    <dialog id="saveErrorDialog" class="error-dialog" role="alertdialog" aria-labelledby="saveErrorTitle" aria-describedby="saveErrorMessage">
      <h2 id="saveErrorTitle">⚠️ Progress Not Saved</h2>
      <p id="saveErrorMessage"></p>
      <p class="error-dialog-hint">
        Your changes are still active in this session, but they will be lost if you close or refresh the page.
      </p>
      <div id="saveErrorActions">
        <button id="retrySaveButton" type="button">Retry Save</button>
        <button id="exportFallbackButton" type="button">Export Save File</button>
        <button id="dismissSaveErrorButton" type="button">Dismiss</button>
      </div>
    </dialog>
  </div>`;

/** A Blockly level: validate -> interpret into a trace -> animate the trace on the grid. */
export class LevelScreen implements Screen {
  private ws: Blockly.WorkspaceSvg | null = null;
  private view: GridView | null = null;
  private player: TracePlayer | null = null;
  private saveCtrl: SaveController | null = null;
  private readonly validator = new Validator();

  constructor(private readonly options: LevelScreenOptions) {}

  mount(root: HTMLElement): void {
    const { level } = this.options;
    const { map } = level;
    root.innerHTML = TEMPLATE;
    const find = <T extends HTMLElement>(id: string) => root.querySelector(`#${id}`) as T;

    const codeEl = find<HTMLElement>('generatedCode').firstElementChild as HTMLElement;
    const statusEl = find<HTMLElement>('status');
    const runButton = find<HTMLButtonElement>('runButton');
    const resultDialog = find<HTMLDialogElement>('resultDialog');
    const resultTitle = find<HTMLElement>('resultTitle');
    const resultMessage = find<HTMLElement>('resultMessage');
    const replayButton = find<HTMLButtonElement>('replayButton');
    const keepEditingButton = find<HTMLButtonElement>('keepEditingButton');
    const continueButton = find<HTMLButtonElement>('continueButton');
    const importFileInput = find<HTMLInputElement>('importFileInput');

    const saveErrorDialog = find<HTMLDialogElement>('saveErrorDialog');
    const saveErrorMessage = find<HTMLElement>('saveErrorMessage');

    find<HTMLElement>('levelTitle').textContent = level.title;
    find<HTMLElement>('levelInstructions').textContent = level.instructions;
    find<HTMLElement>('blockLimit').textContent = `Block limit: ${level.blockLimit}`;
    find<HTMLButtonElement>('backButton').addEventListener('click', this.options.onExit);

    const ws = Blockly.inject(find<HTMLElement>('blocklyDiv'), {
      toolbox: toolboxFor(level.allowedBlocks),
      theme: gameTheme,
      // Loading a level clears the workspace, which puts the start block in the trash can.
      // Capping it at one stops it being dragged back out, duplicated or pasted.
      maxInstances: { start: 1 },
      plugins: { blockDragger: StartBlockDragger },
    });
    // Load the level's starting blocks, if any, with a clean undo history.
    new LevelLoader(ws, levelRegistry).loadLevel(level);
    // Shrink the tiles so wide grids fit the panel. Only the width is checked: the panel
    // scrolls vertically, so a tall grid still fits (no current level is taller than 6 tiles).
    const canvas = find<HTMLDivElement>('gameCanvas');
    const view = new GridView(canvas, map, fitTileSize(map, canvas.clientWidth));
    const player = new TracePlayer(view);
    this.ws = ws;
    this.view = view;
    this.player = player;

    const setStatus = (text: string, tone: 'info' | 'success' | 'error' = 'info') => {
      statusEl.textContent = text;
      statusEl.className = tone;
    };

    const showSaveErrorPopup = (reason: string) => {
      saveErrorMessage.textContent = reason;
      setStatus('Warning: Level progress failed to save.', 'error');
      if (!saveErrorDialog.open) {
        saveErrorDialog.showModal();
      }
    };

    // Show the generated code (without the interpreter's tracking calls).
    const showCode = () => {
      codeEl.textContent = javascriptGenerator.workspaceToCode(ws);
    };

    // SaveController handles the change listener (code preview + per-level auto-save).
    const saveCtrl = new SaveController(ws, level, showCode, showSaveErrorPopup);
    this.saveCtrl = saveCtrl;

    find<HTMLButtonElement>('retrySaveButton').addEventListener('click', () => {
      const result = saveCtrl.saveNow(true);
      if (result.ok) {
        saveErrorDialog.close();
        setStatus('Level progress saved.', 'success');
      } else {
        saveErrorMessage.textContent = result.message;
      }
    });

    find<HTMLButtonElement>('exportFallbackButton').addEventListener('click', () => {
      const levelId = saveCtrl.exportSave();
      saveErrorDialog.close();
      setStatus(`Exported backup save for "${levelId}".`, 'info');
    });

    find<HTMLButtonElement>('dismissSaveErrorButton').addEventListener('click', () => {
      saveErrorDialog.close();
    });

    const run = async () => {
      player.stop();
      const validation = this.validator.validate(ws, level);
      if (!validation.ok) {
        if (validation.blockId) ws.getBlockById(validation.blockId)?.select();
        setStatus(validation.message, 'error');
        return;
      }

      const result = runCode(generateCode(ws), map);
      setStatus('Running...');
      runButton.disabled = true;

      const playback = await player.play(result.trace, map.start, {
        onStep: (step) => ws.highlightBlock(step.blockId),
      });

      // Stopped by Reset, or the screen was closed mid-run.
      if (playback === 'stopped' || this.ws !== ws) return;
      ws.highlightBlock(null);
      runButton.disabled = false;
      const solved = result.outcome === 'reached_goal';
      setStatus(result.message, solved ? 'success' : 'error');
      if (solved) this.options.onComplete();
      if (solved) {
        resultTitle.textContent = 'Level complete! 🏆';
      } else {
        resultTitle.textContent = 'Try again!';
      }

      resultMessage.textContent = result.message;

      replayButton.hidden = !solved;
      keepEditingButton.hidden = solved;
      continueButton.hidden = !solved || !this.options.onContinue;

      resultDialog.showModal();
    };

    const reset = () => {
      player.stop();
      ws.highlightBlock(null);
      view.reset(map.start);
      runButton.disabled = false;
      setStatus('Press Run to start.');
    };

    const resetBlocks = () => {
      if (!window.confirm('Reset all blocks for this level back to the starting state?')) return;
      player.stop();
      saveCtrl.resetBlocks();
      view.reset(map.start);
      runButton.disabled = false;
      setStatus('Blocks reset to default.', 'info');
    };

    replayButton.addEventListener('click', () => {
      resultDialog.close();
      reset();
    });

    keepEditingButton.addEventListener('click', () => {
      resultDialog.close();
    });

    continueButton.addEventListener('click', () => {
      resultDialog.close();

      if (this.options.onContinue) {
        this.options.onContinue();
      }
    });

    find<HTMLButtonElement>('resultRoadmapButton').addEventListener('click', () => {
      resultDialog.close();
      this.options.onExit();
    });

    runButton.addEventListener('click', () => void run());
    find<HTMLButtonElement>('resetButton').addEventListener('click', reset);
    find<HTMLButtonElement>('resetBlocksButton').addEventListener('click', resetBlocks);

    find<HTMLButtonElement>('exportButton').addEventListener('click', () => {
      const levelId = saveCtrl.exportSave();
      setStatus(`Exported save for "${levelId}".`, 'info');
    });

    find<HTMLButtonElement>('importButton').addEventListener('click', () => {
      importFileInput.click();
    });

    importFileInput.addEventListener('change', async () => {
      const file = importFileInput.files?.[0];
      if (!file) return;

      player.stop();
      const result = await saveCtrl.importSave(file);
      setStatus(
        result.ok ? 'Save file imported successfully.' : result.message,
        result.ok ? 'success' : 'error',
      );
      importFileInput.value = '';
    });

    // Load saved blocks for this level (or level.startState if none exist yet).
    saveCtrl.loadLevel(level);
    setStatus('Press Run to start.');
  }

  unmount(): void {
    this.player?.stop();
    this.ws?.dispose();
    this.view?.destroy();
    this.ws = null;
    this.view = null;
    this.player = null;
    this.saveCtrl = null;
  }
}
