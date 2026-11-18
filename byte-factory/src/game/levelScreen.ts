import * as Blockly from 'blockly';
import {javascriptGenerator} from 'blockly/javascript';
import {forBlock as moveGeneration} from '../generators/moveGeneration';
import {actionBlock as actionGeneration} from '../generators/actionGeneration';
import {sensorBlock as sensorGeneration} from '../generators/sensorGeneration';
import {toolbox} from '../toolbox';
import {generateCode, runCode} from '../interpreter/interpreter';
import {GridView} from '../animation/GridView';
import {TracePlayer} from '../animation/TracePlayer';
import {Validator} from '../validator/validator';
import type {CampaignLevel} from '../levels/campaign';
import '../blocks/movement';
import '../blocks/actions';
import '../blocks/sensors';

// Register the generators with Blockly.
Object.assign(javascriptGenerator.forBlock, moveGeneration);
Object.assign(javascriptGenerator.forBlock, actionGeneration);
Object.assign(javascriptGenerator.forBlock, sensorGeneration);

export type LevelScreenOptions = {
  /** The player pressed "Back to map". */
  onExit: () => void;
  /** The robot reached the goal. Return false if the progress could not be saved. */
  onComplete: (levelId: string) => boolean;
};

/**
 * The block-coding screen for one level. It is created once and reused: open() loads a level
 * into it, close() hides it again. Blockly is only injected the first time a level is opened,
 * because it can't size itself inside a hidden element.
 */
export class LevelScreen {
  private readonly validator = new Validator();
  private workspace: Blockly.WorkspaceSvg | null = null;
  private view: GridView | null = null;
  private player: TracePlayer | null = null;
  private current: CampaignLevel | null = null;

  private readonly gameDiv: HTMLDivElement;
  private readonly blocklyDiv: HTMLDivElement;
  private readonly statusEl: HTMLElement | null;
  private readonly titleEl: HTMLElement | null;
  private readonly codeEl: Element | null | undefined;
  private readonly runButton: HTMLButtonElement | null;
  private readonly resetButton: HTMLButtonElement | null;
  private readonly backButton: HTMLButtonElement | null;

  constructor(
    private readonly root: HTMLElement,
    private readonly options: LevelScreenOptions,
  ) {
    const find = <T extends HTMLElement>(id: string) => root.querySelector<T>(`#${id}`);
    const gameDiv = find<HTMLDivElement>('gameCanvas');
    const blocklyDiv = find<HTMLDivElement>('blocklyDiv');
    if (!gameDiv || !blocklyDiv) {
      throw new Error(`div with id 'blocklyDiv' or 'gameCanvas' not found`);
    }
    this.gameDiv = gameDiv;
    this.blocklyDiv = blocklyDiv;
    this.statusEl = find('status');
    this.titleEl = find('levelTitle');
    this.codeEl = find('generatedCode')?.firstChild as Element | null | undefined;
    this.runButton = find<HTMLButtonElement>('runButton');
    this.resetButton = find<HTMLButtonElement>('resetButton');
    this.backButton = find<HTMLButtonElement>('backButton');

    this.runButton?.addEventListener('click', () => void this.run());
    this.resetButton?.addEventListener('click', () => this.reset());
    this.backButton?.addEventListener('click', () => {
      this.close();
      this.options.onExit();
    });
  }

  /** Shows the screen with a fresh workspace and grid for this level. */
  open(entry: CampaignLevel): void {
    this.current = entry;
    this.root.hidden = false;

    if (!this.workspace) {
      this.workspace = Blockly.inject(this.blocklyDiv, {toolbox});
      this.workspace.addChangeListener((e: Blockly.Events.Abstract) => {
        if (e.isUiEvent || e.type === Blockly.Events.FINISHED_LOADING || this.workspace?.isDragging()) {
          return;
        }
        this.showCode();
      });
    } else {
      Blockly.svgResize(this.workspace);
    }
    this.workspace.clear();

    this.player?.stop();
    this.view?.destroy();
    this.gameDiv.innerHTML = '';
    this.view = new GridView(this.gameDiv, entry.map);
    this.player = new TracePlayer(this.view);

    if (this.titleEl) this.titleEl.textContent = entry.title;
    if (this.runButton) this.runButton.disabled = false;
    this.showCode();
    this.setStatus('Press Run to start.');
  }

  /** Hides the screen and stops anything still animating. */
  close(): void {
    this.player?.stop();
    this.workspace?.highlightBlock(null);
    this.current = null;
    this.root.hidden = true;
  }

  private setStatus(text: string, tone: 'info' | 'success' | 'error' = 'info'): void {
    if (!this.statusEl) return;
    this.statusEl.textContent = text;
    this.statusEl.className = tone;
  }

  // Show the generated code (without the interpreter's tracking calls).
  private showCode(): void {
    if (this.codeEl && this.workspace) {
      this.codeEl.textContent = javascriptGenerator.workspaceToCode(this.workspace);
    }
  }

  // Validate -> interpret into a trace -> animate the trace, highlighting each block.
  private async run(): Promise<void> {
    const entry = this.current;
    const ws = this.workspace;
    const player = this.player;
    if (!entry || !ws || !player) return;

    player.stop();
    const validation = this.validator.validate(ws, entry.level);
    if (!validation.ok) {
      if (validation.blockId) ws.getBlockById(validation.blockId)?.select();
      this.setStatus(validation.message, 'error');
      return;
    }

    const result = runCode(generateCode(ws), entry.map);
    this.setStatus('Running...');
    if (this.runButton) this.runButton.disabled = true;

    const playback = await player.play(result.trace, entry.map.start, {
      onStep: (step) => ws.highlightBlock(step.blockId),
    });

    // The player left the level (or restarted it) while the robot was moving.
    if (playback === 'stopped' || this.current !== entry) return;

    ws.highlightBlock(null);
    if (this.runButton) this.runButton.disabled = false;

    if (result.outcome === 'reached_goal') {
      const saved = this.options.onComplete(entry.level.id);
      this.setStatus(
        saved
          ? `${result.message} Level complete! Press "Back to map" to continue.`
          : `${result.message} Level complete, but your progress could not be saved in this browser.`,
        'success',
      );
    } else {
      this.setStatus(result.message, 'error');
    }
  }

  private reset(): void {
    if (!this.current || !this.view) return;
    this.player?.stop();
    this.workspace?.highlightBlock(null);
    this.view.reset(this.current.map.start);
    if (this.runButton) this.runButton.disabled = false;
    this.setStatus('Press Run to start.');
  }
}
