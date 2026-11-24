import * as Blockly from 'blockly';
import { GridView, fitTileSize } from '../../animation/GridView';
import { TracePlayer } from '../../animation/TracePlayer';
import { runWorkspace } from '../../interpreter/interpreter';
import { LessonDemo as LessonDemoData } from '../../lessons/types';

/**
 * The "example" card: a read-only Blockly program next to a small grid, plus a Run Demo button.
 * Uses the real interpreter, so the demo behaves exactly like the level will.
 */
export class LessonDemo {
  private ws: Blockly.WorkspaceSvg | null = null;
  private view: GridView | null = null;
  private player: TracePlayer | null = null;

  constructor(private readonly demo: LessonDemoData) {}

  /** Build the workspace and grid inside the two containers. */
  mount(blocksEl: HTMLElement, gridEl: HTMLDivElement): void {
    // TODO:
    // 1. Blockly.inject(blocksEl, { readOnly: true, ... }) and load demo.blocks with
    //    Blockly.serialization.workspaces.load. Reuse LevelScreen's gameTheme (export it first).
    // 2. new GridView(gridEl, demo.map, fitTileSize(demo.map, gridEl.clientWidth))
    // 3. new TracePlayer(view)
  }

  /** Run the demo program once, highlighting each block as it runs. */
  async run(): Promise<void> {
    // TODO: runWorkspace(ws, demo.map), then player.play(result.trace, demo.map.start, { onStep })
    // and highlight blocks like LevelScreen does. Clear the highlight when it finishes.
  }

  /** Stop playback and put the robot back on its start tile. */
  reset(): void {
    // TODO
  }

  destroy(): void {
    // TODO: stop the player, dispose the workspace, destroy the view (same order as LevelScreen.unmount)
  }
}
