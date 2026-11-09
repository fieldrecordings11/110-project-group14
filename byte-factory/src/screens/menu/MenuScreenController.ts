import Konva from 'konva';
import type { Screen } from '../../app/Screen';
import { MenuScreenView, ScreenController } from './MenuScreenView';
import type { View } from './View';

const WIDTH = 800;
const HEIGHT = 600;

/** The main menu screen: draws MenuScreenView on its own Konva stage. */
export class MenuScreenController extends ScreenController implements Screen {
  private readonly view: MenuScreenView;
  private stage: Konva.Stage | null = null;

  constructor(onPlay: () => void) {
    super();
    this.view = new MenuScreenView(onPlay);
  }

  getView(): View {
    return this.view;
  }

  mount(root: HTMLElement): void {
    const container = document.createElement('div');
    container.className = 'menu-screen';
    const canvas = document.createElement('div');
    container.appendChild(canvas);
    root.appendChild(container);

    this.stage = new Konva.Stage({ container: canvas, width: WIDTH, height: HEIGHT });
    const layer = new Konva.Layer();
    layer.add(this.view.getGroup());
    this.stage.add(layer);
  }

  unmount(): void {
    this.stage?.destroy();
    this.stage = null;
  }
}
