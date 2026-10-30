import Konva from 'konva';
import type { Group } from "konva/lib/Group";
import type { View } from "./View";

export class MenuScreenView implements View {
	private group: Konva.Group;

	constructor(onStartClick: () => void) {
		this.group = new Konva.Group({ visible: true });

		// Title text
		const title = new Konva.Text({
			x: 800 / 2,
			y: 150,
			text: "ROBOT CODE GAME",
			fontSize: 48,
			fontFamily: "Arial",
			fill: "White",
			align: "center",
		});
		// Center the text using offsetX
		title.offsetX(title.width() / 2);
		this.group.add(title);

		const startButtonGroup = new Konva.Group();
		const startButton = new Konva.Rect({
			x: 800 / 2 - 100,
			y: 300,
			width: 200,
			height: 60,
			fill: "green",
			cornerRadius: 10,
			stroke: "darkgreen",
			strokeWidth: 3,
		});
		const startText = new Konva.Text({
			x: 800 / 2,
			y: 315,
			text: "PLAY",
			fontSize: 24,
			fontFamily: "Arial",
			fill: "white",
			align: "center",
		});
		startText.offsetX(startText.width() / 2);
		startButtonGroup.add(startButton);
		startButtonGroup.add(startText);
		startButtonGroup.on("click", onStartClick);
		startButtonGroup.on("tap", onStartClick); // touchscreen support
		this.group.add(startButtonGroup);
	}

	getGroup(): Group {
		return this.group;
	}

	show(): void {
		this.group.show();
	}

	hide(): void {
		this.group.hide();
	}
}

export abstract class ScreenController {
	abstract getView(): View;

	show(): void {
		this.getView().show();
	}

	hide(): void {
		this.getView().hide();
	}
}