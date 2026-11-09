import { Screen } from './Screen';

/** Swaps screens inside one root element: unmounts the current screen, then mounts the next. */
export class ScreenManager {
  private current: Screen | null = null;

  constructor(private readonly root: HTMLElement) {}

  show(next: Screen): void {
    this.current?.unmount();
    this.root.replaceChildren();
    this.current = next;
    next.mount(this.root);
  }
}
