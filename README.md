# Byte Factory

A Blockly puzzle game where players stack code blocks to move a robot to a goal on a grid. One demo level is playable as of now.

## Running it

From `byte-factory/`, using Node 22:

- `npm ci`: install dependencies
- `npm start`: run the game
- `npm run preview:roadmap`: run the roadmap screen (port 8081)
- `npm test`: run the tests
- `npm run build`: production build

CI runs typecheck, tests and the build on every PR. A test file with no tests fails CI, so use `it.todo(...)` as a placeholder.

## Code layout (`byte-factory/src/`)

- `index.ts`: sets up Blockly and the Run and Reset buttons
- `blocks/`, `generators/`: custom blocks (movement, actions, sensors) and the code each one generates
- `validator/`: checks a program before it runs (not empty, only allowed blocks, under the block limit)
- `interpreter/`: runs the program on the grid and records each step
- `animation/`: draws the grid and animates the robot's steps
- `levels/`: the `Level` type, the level list (`data.ts`, empty for now), `LevelRegistry`, and the demo level
- `screens/`: roadmap / level select (not on the main page yet)
- `hangman/`: vocabulary minigame (not on the main page yet)
- `tests/`: Vitest tests

## Branches

**Merged:** CI (#26), interpreter + animation (#31), validator + levels (#28), blocks (#33), roadmap (#36), Hangman (#35).

**Not merged:**
- `Main-Menu`: menu screen. It sits outside `byte-factory/`, so it needs moving before it can merge.
- `level-loader`: loader skeleton, doesn't compile yet.
- `blockly-compiler`: old approach, replaced by the interpreter.

## Known gaps

- Action and sensor blocks crash when run. The interpreter only supports movement.
- Only the demo level exists, and the toolbox is the same for every level.
- The roadmap and Hangman aren't connected to the game yet.
- There's no `start` block yet, although the validator expects one.


