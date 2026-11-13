import Konva from 'konva';
import type { Group } from "konva/lib/Group";
import type { View } from "./View";

export class MenuScreenView implements View {
	private group: Konva.Group;

	constructor(
		onStartClick: () => void,
		onHangmanClick: () => void,
		onTriviaClick: () => void
	) {
		this.group = new Konva.Group({ visible: true });

		// Title text
		const title = new Konva.Text({
			x: 800 / 2,
			y: 150,
			text: "BYTE FACTORY",
			fontSize: 48,
			fontFamily: "Arial",
			fill: "White",
			align: "center",
		});
		// Center the text using offsetX
		title.offsetX(title.width() / 2);
		this.group.add(title);

		// Button layout
		const buttonWidth = 200;
		const buttonHeight = 60;
		const buttonGap = 20; // space between buttons
		const startY = 300;
		const buttonX = 800 / 2 - buttonWidth / 2;

		// Stacked buttons
		this.group.add(
			this.createButton("PLAY", buttonX, startY, buttonWidth, buttonHeight, onStartClick)
		);
		this.group.add(
			this.createButton("HANGMAN", buttonX, startY + (buttonHeight + buttonGap), buttonWidth, buttonHeight, onHangmanClick)
		);
		this.group.add(
			this.createButton("TRIVIA", buttonX, startY + 2 * (buttonHeight + buttonGap), buttonWidth, buttonHeight, onTriviaClick)
		);
	}

	private createButton(
		label: string,
		x: number,
		y: number,
		width: number,
		height: number,
		onClick: () => void
	): Konva.Group {
		const buttonGroup = new Konva.Group();

		const rect = new Konva.Rect({
			x,
			y,
			width,
			height,
			fill: "green",
			cornerRadius: 10,
			stroke: "darkgreen",
			strokeWidth: 3,
		});

		// Text fills the button and is centered both ways
		const text = new Konva.Text({
			x,
			y,
			width,
			height,
			text: label,
			fontSize: 24,
			fontFamily: "Arial",
			fill: "white",
			align: "center",
			verticalAlign: "middle",
		});

		buttonGroup.add(rect);
		buttonGroup.add(text);
		buttonGroup.on("click", onClick);
		buttonGroup.on("tap", onClick); // touchscreen support

		return buttonGroup;
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