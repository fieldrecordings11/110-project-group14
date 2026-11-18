/** One page of the app (menu, roadmap, level). ScreenManager shows one at a time. */
export interface Screen {
  /** Build the screen inside root. root is already empty and attached to the page. */
  mount(root: HTMLElement): void;
  /** Tear down everything mount created: Konva stages, Blockly workspaces, listeners. */
  unmount(): void;
}
