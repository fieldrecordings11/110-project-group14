import Konva from "konva";
import { MenuScreenView } from "./MenuScreenView";
import type { View } from "./View";

const STAGE_WIDTH = 800;
const STAGE_HEIGHT = 600;

class Main {
	private stage: Konva.Stage;
	private layer: Konva.Layer;
	private menuView: MenuScreenView;
	private currentScreen: View;

	constructor(containerId: string) {
		// The stage is the canvas area. "containerId" is the id of a <div> in your HTML.
		this.stage = new Konva.Stage({
			container: containerId,
			width: STAGE_WIDTH,
			height: STAGE_HEIGHT,
		});

		// A layer is a drawing surface on the stage. Shapes live on layers.
		this.layer = new Konva.Layer();
		this.stage.add(this.layer);

		// Create the menu view and tell it what each button should do
		this.menuView = new MenuScreenView(
			() => this.onPlay(),
			() => this.onHangman(),
			() => this.onTrivia()
		);

		// Add the menu's group to the layer so it can be drawn
		this.layer.add(this.menuView.getGroup());

		// Start on the menu
		this.currentScreen = this.menuView;
		this.currentScreen.show();

		this.layer.draw();
	}

	// Hides the current screen, shows the new one, and redraws the canvas
	private switchTo(screen: View): void {
		this.currentScreen.hide();
		this.currentScreen = screen;
		this.currentScreen.show();
		this.layer.draw();
	}

	// Placeholders: replace these with switchTo(yourGameView) later
	private onPlay(): void {
		console.log("PLAY clicked");
	}

	private onHangman(): void {
		console.log("HANGMAN clicked");
	}

	private onTrivia(): void {
		console.log("TRIVIA clicked");
	}
}

// Start the app. Matches <div id="menu-preview"></div> in index.html.
new Main("menu-preview");