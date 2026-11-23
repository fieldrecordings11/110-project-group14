import Konva from 'konva';
import { TriviaScreenView } from './triviaScreenView';

const STAGE_WIDTH = 800;
const STAGE_HEIGHT = 600;

/**
 * Opens the trivia quiz in a full-screen overlay (same idea as HangmanMinigame).
 * Usage: trivia.open(() => { ...runs after the player leaves the quiz... });
 */
export class TriviaMinigame {
	private overlay: HTMLDivElement | null = null;
	private stage: Konva.Stage | null = null;
	private view: TriviaScreenView | null = null;
	private onCloseCallback: () => void = () => {};

	open(onClose: () => void = () => {}): void {
		if (this.overlay) return; // already open
		this.onCloseCallback = onClose;

		// Overlay that covers the page and centers the canvas
		const overlay = document.createElement('div');
		Object.assign(overlay.style, {
			position: 'fixed',
			inset: '0',
			background: 'rgba(0, 0, 0, 0.85)',
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'center',
			zIndex: '1000',
		});
		const container = document.createElement('div');
		overlay.appendChild(container);
		document.body.appendChild(overlay);

		// Shrink to fit small windows (never scale up)
		const scale = Math.min(1, window.innerWidth / STAGE_WIDTH, window.innerHeight / STAGE_HEIGHT);
		const stage = new Konva.Stage({
			container,
			width: STAGE_WIDTH * scale,
			height: STAGE_HEIGHT * scale,
		});
		stage.scale({ x: scale, y: scale });

		const layer = new Konva.Layer();
		stage.add(layer);

		// Background panel
		layer.add(new Konva.Rect({ x: 0, y: 0, width: STAGE_WIDTH, height: STAGE_HEIGHT, fill: '#1e1e2e' }));

		const view = new TriviaScreenView(() => this.close());
		layer.add(view.getGroup());
		view.show(); // starts a fresh quiz now that the layer exists

		window.addEventListener('keydown', this.onKeyDown);

		this.overlay = overlay;
		this.stage = stage;
		this.view = view;
	}

	close(): void {
		if (!this.overlay) return;

		window.removeEventListener('keydown', this.onKeyDown);
		this.view?.hide();
		this.stage?.destroy();
		this.overlay.remove();
		this.overlay = null;
		this.stage = null;
		this.view = null;

		this.onCloseCallback();
	}

	private onKeyDown = (e: KeyboardEvent): void => {
		if (e.key === 'Escape') this.close();
	};
}