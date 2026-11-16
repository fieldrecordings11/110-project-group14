import * as Blockly from 'blockly';
import { javascriptGenerator } from 'blockly/javascript';
import type { Screen } from '../../app/Screen';
import { GridView } from '../../animation/GridView';
import { TracePlayer } from '../../animation/TracePlayer';
import { forBlock as moveGeneration } from '../../generators/moveGeneration';
import { actionBlock as actionGeneration } from '../../generators/actionGeneration';
import { sensorBlock as sensorGeneration } from '../../generators/sensorGeneration';
import { generateCode, runCode } from '../../interpreter/interpreter';
import { GridMap } from '../../interpreter/types';
import { Level } from '../../levels/types';
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
  title: string;
  level: Level;
  map: GridMap;
  /** Called each time the robot reaches the goal. */
  onComplete: () => void;
  onExit: () => void;
};

const TEMPLATE = `
  <div id="pageContainer">
    <div id="outputPane">
      <div id="levelHeader">
        <button id="backButton" type="button">← Roadmap</button>
        <h2 id="levelTitle"></h2>
      </div>
      <div id="gameCanvas"></div>
      <div id="controls">
        <button id="runButton" type="button">Run</button>
        <button id="resetButton" type="button">Reset</button>
      </div>
      <p id="status"></p>
      <pre id="generatedCode"><code></code></pre>
    </div>
    <div id="blocklyDiv"></div>
  </div>`;

/** A Blockly level: validate -> interpret into a trace -> animate the trace on the grid. */
export class LevelScreen implements Screen {
  private ws: Blockly.WorkspaceSvg | null = null;
  private view: GridView | null = null;
  private player: TracePlayer | null = null;
  private readonly validator = new Validator();

  constructor(private readonly options: LevelScreenOptions) {}

  mount(root: HTMLElement): void {
    const { title, level, map } = this.options;
    root.innerHTML = TEMPLATE;
    const find = <T extends HTMLElement>(id: string) => root.querySelector(`#${id}`) as T;

    const codeEl = find<HTMLElement>('generatedCode').firstElementChild as HTMLElement;
    const statusEl = find<HTMLElement>('status');
    const runButton = find<HTMLButtonElement>('runButton');
    find<HTMLElement>('levelTitle').textContent = title;
    find<HTMLButtonElement>('backButton').addEventListener('click', this.options.onExit);

    const ws = Blockly.inject(find<HTMLElement>('blocklyDiv'), { toolbox });
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

    runButton.addEventListener('click', () => void run());
    find<HTMLButtonElement>('resetButton').addEventListener('click', reset);

    showCode();
    setStatus('Press Run to start.');

    // Keep the generated code panel up to date.
    ws.addChangeListener((e: Blockly.Events.Abstract) => {
      if (e.isUiEvent || e.type == Blockly.Events.FINISHED_LOADING || ws.isDragging()) {
        return;
      }
      showCode();
    });
  }

  unmount(): void {
    this.player?.stop();
    this.ws?.dispose();
    this.view?.destroy();
    this.ws = null;
    this.view = null;
    this.player = null;
  }
}
