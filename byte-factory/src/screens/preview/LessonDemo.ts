import * as Blockly from 'blockly';
import { GridView, fitTileSize } from '../../animation/GridView';
import { TracePlayer } from '../../animation/TracePlayer';
import { runWorkspace } from '../../interpreter/interpreter';
import { LessonDemo as LessonDemoData } from '../../lessons/types';
import { gameTheme } from '../level/gameTheme';
import '../../blocks/movement';
import '../../blocks/sensors';
import '../../blocks/events';

// Demo grids are small, so let their tiles grow past the level's 48px (the sprites are 24px pixel art).
const MAX_DEMO_TILE = 72;

/**
 * The "example" card: a read-only Blockly program next to a small grid.
 * Uses the real interpreter, so the demo behaves exactly like the level will.
 */
export class LessonDemo {
  private ws: Blockly.WorkspaceSvg | null = null;
  private view: GridView | null = null;
  private player: TracePlayer | null = null;

  constructor(private readonly demo: LessonDemoData) {}

  /** Build the workspace and grid. Both containers must already be on the page, so they have a size. */
  mount(blocksEl: HTMLElement, gridEl: HTMLDivElement): void {
    const { map, blocks } = this.demo;
    const ws = Blockly.inject(blocksEl, {
      readOnly: true,
      theme: gameTheme,
      move: { scrollbars: false, drag: false, wheel: false },
      zoom: { startScale: 1.2 },
    });
    Blockly.serialization.workspaces.load(blocks, ws);

    const view = new GridView(gridEl, map, fitTileSize(map, gridEl.clientWidth, MAX_DEMO_TILE));
    this.ws = ws;
    this.view = view;
    this.player = new TracePlayer(view);
  }

  /** Run the demo program once, highlighting each block as it runs. */
  async run(): Promise<void> {
    const { ws, player } = this;
    if (!ws || !player) return;

    const result = runWorkspace(ws, this.demo.map);
    const playback = await player.play(result.trace, this.demo.map.start, {
      onStep: (step) => ws.highlightBlock(step.blockId),
    });
    // Destroyed mid-run (the player changed page or left the screen).
    if (playback === 'stopped' || this.ws !== ws) return;
    ws.highlightBlock(null);
  }

  destroy(): void {
    this.player?.stop();
    this.ws?.dispose();
    this.view?.destroy();
    this.ws = null;
    this.view = null;
    this.player = null;
  }
}
