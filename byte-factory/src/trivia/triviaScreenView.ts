import Konva from 'konva';

interface TriviaQuestion {
	question: string;
	choices: string[];
	correctIndex: number;
}

const QUESTIONS: TriviaQuestion[] = [
	{
		question: "What is the purpose of a loop in programming?",
		choices: [
			"To store information",
			"To repeat instructions",
			"To delete information",
			"To make a decision",
		],
		correctIndex: 1,
	},
	{
		question: "What is a variable used for?",
		choices: [
			"To store information",
			"To repeat an action",
			"To stop a program",
			"To check if something is true",
		],
		correctIndex: 0,
	},
	{
		question: "What does a conditional help a program do?",
		choices: [
			"Repeat an action forever",
			"Store a number",
			"Make decisions based on certain conditions",
			"Delete a variable",
		],
		correctIndex: 2,
	},
	{
		question: "What is an example of a Boolean value?",
		choices: [
			"\"Hello\"",
			"25",
			"3.14",
			"True",
		],
		correctIndex: 3,
	},
	{
		question: "What happens when a loop's condition is no longer true?",
		choices: [
			"The loop stops repeating",
			"The program deletes itself",
			"The loop starts over automatically",
			"The variable disappears",
		],
		correctIndex: 0,
	},
	{
		question: "In a video game, what type of information would a score variable store?",
		choices: [
			"The player's name",
			"The player's current points",
			"The game's background music",
			"The color of the screen",
		],
		correctIndex: 1,
	},
	{
		question: "What is the difference between an If-Else statement and an If statement?",
		choices: [
			"An If-Else statement can choose between two possible actions",
			"An If statement repeats instructions",
			"An If-Else statement only works with numbers",
			"There is no difference",
		],
		correctIndex: 0,
	},
	{
		question: "Which data type is best for storing someone's name?",
		choices: [
			"Integer",
			"Boolean",
			"String",
			"Float",
		],
		correctIndex: 2,
	},
	{
		question: "What is an infinite loop?",
		choices: [
			"A loop that runs only once",
			"A loop that repeats forever",
			"A loop that stores information",
			"A loop that makes decisions",
		],
		correctIndex: 1,
	},
	{
		question: "In a game, how could a program check if a player has won?",
		choices: [
			"By checking whether the player's score has reached the required amount",
			"By deleting the player's score",
			"By repeating the same action forever",
			"By changing the player's name",
		],
		correctIndex: 0,
	},
];

const CANVAS_WIDTH = 800;
const FEEDBACK_DELAY_MS = 1200;

export class TriviaScreenView {
	private group: Konva.Group;
	private contentGroup: Konva.Group; // holds whatever is currently on screen (question or results)

	private questions: TriviaQuestion[] = [];
	private currentIndex = 0;
	private score = 0;
	private locked = false; // blocks extra clicks while showing feedback
	private advanceTimer: number | null = null;

	constructor(private onMenuClick: () => void = () => {}) {
		this.group = new Konva.Group({ visible: true });
		this.contentGroup = new Konva.Group();
		this.group.add(this.contentGroup);

		this.reset();
	}

	/** Start (or restart) the quiz with a freshly shuffled question order. */
	reset(): void {
		this.clearTimer();
		this.questions = [...QUESTIONS].sort(() => Math.random() - 0.5);
		this.currentIndex = 0;
		this.score = 0;
		this.locked = false;
		this.showQuestion();
	}

	private showQuestion(): void {
		this.contentGroup.destroyChildren();
		const q = this.questions[this.currentIndex];

		// Header: question number + running score
		const progress = new Konva.Text({
			x: 80,
			y: 40,
			text: `Question ${this.currentIndex + 1} of ${this.questions.length}`,
			fontSize: 24,
			fontFamily: "Arial",
			fill: "white",
		});
		const scoreText = new Konva.Text({
			x: CANVAS_WIDTH - 80,
			y: 40,
			text: `Score: ${this.score}`,
			fontSize: 24,
			fontFamily: "Arial",
			fill: "white",
			align: "right",
		});
		scoreText.offsetX(scoreText.width());
		this.contentGroup.add(progress, scoreText);

		// Question text (wraps and is centered in its box)
		const questionText = new Konva.Text({
			x: 80,
			y: 110,
			width: CANVAS_WIDTH - 160,
			height: 90,
			text: q.question,
			fontSize: 30,
			fontFamily: "Arial",
			fill: "white",
			align: "center",
			verticalAlign: "middle",
		});
		this.contentGroup.add(questionText);

		// Answer buttons
		const buttonWidth = 500;
		const buttonHeight = 60;
		const buttonGap = 15;
		const startY = 220;
		const buttonX = CANVAS_WIDTH / 2 - buttonWidth / 2;

		const rects: Konva.Rect[] = [];

		q.choices.forEach((choice, i) => {
			const { group, rect } = this.createButton(
				choice,
				buttonX,
				startY + i * (buttonHeight + buttonGap),
				buttonWidth,
				buttonHeight,
				() => this.handleAnswer(i, rects)
			);
			rects.push(rect);
			this.contentGroup.add(group);
		});

		this.redraw();
	}

	private handleAnswer(selected: number, rects: Konva.Rect[]): void {
		if (this.locked) return;
		this.locked = true;

		const correct = this.questions[this.currentIndex].correctIndex;

		if (selected === correct) {
			this.score++;
			rects[selected].fill("limegreen");
		} else {
			rects[selected].fill("crimson");
			rects[correct].fill("limegreen"); // reveal the right answer
		}
		this.redraw();

		this.advanceTimer = window.setTimeout(() => {
			this.advanceTimer = null;
			this.currentIndex++;
			this.locked = false;

			if (this.currentIndex < this.questions.length) {
				this.showQuestion();
			} else {
				this.showResults();
			}
		}, FEEDBACK_DELAY_MS);
	}

	private showResults(): void {
		this.contentGroup.destroyChildren();
		const total = this.questions.length;

		const title = new Konva.Text({
			x: CANVAS_WIDTH / 2,
			y: 120,
			text: "QUIZ COMPLETE!",
			fontSize: 48,
			fontFamily: "Arial",
			fill: "white",
			align: "center",
		});
		title.offsetX(title.width() / 2);

		const scoreText = new Konva.Text({
			x: CANVAS_WIDTH / 2,
			y: 210,
			text: `Your score: ${this.score} / ${total}`,
			fontSize: 36,
			fontFamily: "Arial",
			fill: "yellow",
			align: "center",
		});
		scoreText.offsetX(scoreText.width() / 2);

		const message = new Konva.Text({
			x: CANVAS_WIDTH / 2,
			y: 270,
			text: this.getResultMessage(total),
			fontSize: 24,
			fontFamily: "Arial",
			fill: "white",
			align: "center",
		});
		message.offsetX(message.width() / 2);

		this.contentGroup.add(title, scoreText, message);

		const buttonWidth = 200;
		const buttonHeight = 60;
		const buttonX = CANVAS_WIDTH / 2 - buttonWidth / 2;

		this.contentGroup.add(
			this.createButton("PLAY AGAIN", buttonX, 340, buttonWidth, buttonHeight, () => this.reset()).group
		);
		this.contentGroup.add(
			this.createButton("MENU", buttonX, 340 + buttonHeight + 20, buttonWidth, buttonHeight, this.onMenuClick).group
		);

		this.redraw();
	}

	private getResultMessage(total: number): string {
		const ratio = this.score / total;
		if (ratio === 1) return "Perfect score! Flawless!";
		if (ratio >= 0.7) return "Great job!";
		if (ratio >= 0.4) return "Not bad — try again to improve!";
		return "Keep practicing!";
	}

	private createButton(
		label: string,
		x: number,
		y: number,
		width: number,
		height: number,
		onClick: () => void
	): { group: Konva.Group; rect: Konva.Rect } {
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
			fontSize: 22,
			fontFamily: "Arial",
			fill: "white",
			align: "center",
			verticalAlign: "middle",
			padding: 6,
		});

		buttonGroup.add(rect);
		buttonGroup.add(text);
		buttonGroup.on("click", onClick);
		buttonGroup.on("tap", onClick); // touchscreen support

		return { group: buttonGroup, rect };
	}

	private redraw(): void {
		this.group.getLayer()?.batchDraw();
	}

	private clearTimer(): void {
		if (this.advanceTimer !== null) {
			window.clearTimeout(this.advanceTimer);
			this.advanceTimer = null;
		}
	}

	getGroup(): Konva.Group {
		return this.group;
	}

	show(): void {
		this.reset(); // always start a fresh quiz when the screen is shown
		this.group.show();
	}

	hide(): void {
		this.clearTimer();
		this.group.hide();
	}
}