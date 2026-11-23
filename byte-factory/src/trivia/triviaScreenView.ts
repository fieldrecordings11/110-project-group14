import Konva from 'konva';

interface TriviaQuestion {
	question: string;
	choices: string[];
	correctIndex: number;
}

const QUESTIONS: TriviaQuestion[] = [
	{ question: "What does HTML stand for?", choices: ["HyperText Markup Language", "High Tech Modern Language", "HyperTransfer Markup Logic", "Home Tool Markup Language"], correctIndex: 0 },
	{ question: "How many bits are in a byte?", choices: ["4", "16", "8", "32"], correctIndex: 2 },
	{ question: "Which language runs natively in web browsers?", choices: ["Python", "Java", "C++", "JavaScript"], correctIndex: 3 },
	{ question: "What does CPU stand for?", choices: ["Central Processing Unit", "Computer Personal Unit", "Core Program Utility", "Central Program Updater"], correctIndex: 0 },
	{ question: "Which data structure follows Last-In, First-Out (LIFO)?", choices: ["Queue", "Stack", "Array", "Graph"], correctIndex: 1 },
	{ question: "What is the decimal number 5 in binary?", choices: ["110", "011", "111", "101"], correctIndex: 3 },
	{ question: "Which company created TypeScript?", choices: ["Google", "Apple", "Microsoft", "Amazon"], correctIndex: 2 },
	{ question: "What is CSS mainly used for?", choices: ["Database queries", "Styling web pages", "Server logic", "Encrypting data"], correctIndex: 1 },
	{ question: "What does RAM stand for?", choices: ["Read Always Memory", "Random Access Memory", "Run Active Module", "Rapid Array Machine"], correctIndex: 1 },
	{ question: "Which symbol starts a single-line comment in TypeScript?", choices: ["#", "<!--", "//", "--"], correctIndex: 2 },
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