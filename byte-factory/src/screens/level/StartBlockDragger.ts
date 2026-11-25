import * as Blockly from 'blockly';

/**
 * The start block can't be deleted, so Blockly ignores it when it's dropped on the trash
 * can or the toolbox. Instead, delete the blocks attached under it and put it back where
 * the drag began. Register with Blockly.inject's `plugins: { blockDragger: StartBlockDragger }`.
 */
export class StartBlockDragger extends Blockly.dragging.Dragger {
  override onDragEnd(e?: PointerEvent | KeyboardEvent): void {
    const start = this.draggable;
    const clearStack =
      start instanceof Blockly.BlockSvg &&
      start.type === 'start' &&
      e instanceof PointerEvent &&
      this.isOverDeleteArea(e);
    // super.onDragEnd closes the event group; reopen it so one undo restores the whole stack.
    const group = Blockly.Events.getGroup();

    super.onDragEnd(e);
    if (!clearStack) return;

    Blockly.Events.setGroup(group);
    try {
      start.getNextBlock()?.dispose(false, true);
      start.moveTo(this.startLoc, ['drag']);
    } finally {
      Blockly.Events.setGroup(false);
    }
  }

  /** Same check as Dragger.wouldDeleteDraggable, minus "is the block deletable". */
  private isOverDeleteArea(e: PointerEvent): boolean {
    const workspace = this.draggable.workspace;
    const target = workspace.getDragTarget(new Blockly.utils.Coordinate(e.clientX, e.clientY));
    return (
      target !== null &&
      workspace
        .getComponentManager()
        .hasCapability(target.id, Blockly.ComponentManager.Capability.DELETE_AREA)
    );
  }
}
