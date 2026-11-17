# Byte Factory

A Blockly puzzle game where players build programs to move a robot to a goal. Levels teach sequencing, loops, and conditionals, with a Hangman minigame to practice programming vocabulary.

## Running the game

Use Node.js 22.12 or newer. From `byte-factory/`, run:

```bash
npm ci
npm start
```

Other commands:

```bash
npm run hangman          # Run Hangman independently
npm run preview:roadmap  # Preview the roadmap
npm test                 # Run automated tests
npx tsc --noEmit          # Check TypeScript types
npm run build            # Create a production build
```

## How to play

1. Open the main game and select an available activity on the roadmap.
2. Read the level instructions and drag Blockly blocks into the workspace.
3. Connect the blocks into a program and press **Run**.
4. Guide the robot to the goal while following the level's block limit.
5. Complete activities to unlock the next roadmap stop.

Levels introduce movement in sequence, repeated instructions with loops, and decisions using conditionals and sensors. Some puzzles include puddles that the robot must jump over.

Hangman asks programming questions and provides hints, a timer, and a score at the end of the session.

## Saving your work

Blockly workspaces are saved automatically in browser storage, separately for each level.

- **Export Save:** download your workspace as a JSON file.
- **Import Save:** restore a compatible save for the current level.
- **Reset Blocks:** restore the level's starting blocks.

Roadmap completion is also stored in the browser. Clearing browser storage removes locally saved work and progress.

## Code layout

The application code is in `byte-factory/src/`.

- `index.ts`: connects the application screens.
- `app/`: screen management and roadmap activity definitions.
- `screens/`: main menu, roadmap, and puzzle screens.
- `levels/`: level definitions, registry, loading, and toolbox configuration.
- `blocks/` and `generators/`: Blockly blocks and their generated code.
- `validator/`: checks allowed blocks and block limits before running.
- `interpreter/`: executes programs and records the robot's actions.
- `animation/`: draws the grid and animates those actions.
- `saves/`: workspace saving, importing, exporting, and resetting.
- `hangman/`: minigame logic, questions, and interface.
- `tests/`: most automated tests; roadmap tests also live in `screens/`.

## Adding a level

Define the level with a unique ID, title, instructions, map, allowed blocks, and block limit. Starting blocks are optional.

Register it in `levels/data.ts` and add a matching entry in `app/roadmapEntries.ts`. Add tests to check that the map is valid and the intended solution reaches the goal.

## Testing and CI

GitHub Actions runs TypeScript checks, Vitest tests, and a production build on pull requests and pushes to `main`.

Tests cover blocks and code generation, validation, program execution, animation playback, level loading, roadmap progression, puzzle solutions, and workspace saves.

[View CI runs](https://github.com/fieldrecordings11/110-project-group14/actions)

## Current limitations

- Some action blocks, such as picking up items and toggling switches, are not supported by the interpreter yet.
- The Trivia menu option is a placeholder.
- Introductory lesson content and the expanded menu still need full integration into the main application.

## Project tracking

- [Backlog and task board](https://github.com/users/fieldrecordings11/projects/3)
- [Pull requests and implementation details](https://github.com/fieldrecordings11/110-project-group14/pulls)

