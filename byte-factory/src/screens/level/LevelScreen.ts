import * as Blockly from 'blockly';
import { javascriptGenerator } from 'blockly/javascript';
import type { Screen } from '../../app/Screen';
import { GridView } from '../../animation/GridView';
import { TracePlayer } from '../../animation/TracePlayer';
import { forBlock as moveGeneration } from '../../generators/moveGeneration';
import { actionBlock as actionGeneration } from '../../generators/actionGeneration';
import { sensorBlock as sensorGeneration } from '../../generators/sensorGeneration';
import { generateCode, runCode } from '../../interpreter/interpreter';
import { levelRegistry } from '../../levels';
import { LevelLoader } from '../../levels/loader';
import { buildToolbox } from '../../levels/toolbox';
import { Level } from '../../levels/types';
import { SaveController } from '../../saves/saveController';
import { toolbox } from '../../toolbox';
import { Validator } from '../../validator/validator';
import '../../blocks/movement';
import '../../blocks/actions';
import '../../blocks/sensors';

// Register the blocks' generators with Blockly
Object.assign(javascriptGenerator.forBlock, moveGeneration);
Object.assign(javascriptGenerator.forBlock, actionGeneration);
Object.assign(javascriptGenerator.forBlock, sensorGeneration);

export type LevelScreenOptions = {
  level: Level;
  /** Called each time the robot reaches the goal. */
  onComplete: () => void;
  onExit: () => void;
};

const gameTheme = Blockly.Theme.defineTheme('gameTheme', {
  name: 'gameTheme',
  base: Blockly.Themes.Classic,
  fontStyle: {
    family: 'monospace',
    size: 12,
    weight: 'bold',
  },
  componentStyles: {
    workspaceBackgroundColour: '#07100c',
    toolboxBackgroundColour: '#0e1711',
    toolboxForegroundColour: '#e5eee4',
    flyoutBackgroundColour: '#17231b',
    flyoutForegroundColour: '#e5eee4',
    flyoutOpacity: 1,
    scrollbarColour: '#56616e',
  },
});

const TEMPLATE = `
  <div class="level-screen">
    <header id="gameHeader">
      <div id="levelHeader">
        <button id="backButton" type="button">← Roadmap</button>
        <h1 id="levelTitle"></h1>
      </div>
      <p>Move the robot to the goal.</p>
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
        main
      </div>
    </div>
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
    find<HTMLElement>('levelTitle').textContent = level.title;
    find<HTMLButtonElement>('backButton').addEventListener('click', this.options.onExit);

    const ws = Blockly.inject(find<HTMLElement>('blocklyDiv'), { toolbox: buildToolbox(level.allowedBlocks) });
    // Load the level's starting blocks, if any, with a clean undo history.
    new LevelLoader(ws, levelRegistry).loadLevel(level);
    const view = new GridView(find<HTMLDivElement>('gameCanvas'), map);
    const player = new TracePlayer(view);
    this.ws = ws;
    this.view = view;
    this.player = player;

    const setStatus = (text: string, tone: 'info' | 'success' | 'error' = 'info') => {
      statusEl.textContent = text;
      statusEl.className = tone;
    };

    // Show the generated code (without the interpreter's tracking calls).
    const showCode = () => {
      codeEl.textContent = javascriptGenerator.workspaceToCode(ws);
    };

    // SaveController handles the change listener (code preview + per-level auto-save).
    const saveCtrl = new SaveController(ws, level, showCode);
    this.saveCtrl = saveCtrl;

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