/** Which part of the mock level screen a tutorial page points at. */
export type TutorialTarget =
  | 'back'
  | 'info'
  | 'toolbox'
  | 'workspace'
  | 'grid'
  | 'run'
  | 'resets'
  | 'saves'
  | 'code';

/** Where the arrow sits relative to the highlighted part (it points the other way). */
export type ArrowSide = 'top' | 'bottom' | 'left' | 'right';

export type TutorialStep = {
  title: string;
  body: string;
  /** Part of the mock UI to highlight. Pages without a target show no spotlight. */
  target?: TutorialTarget;
  arrow?: ArrowSide;
};

export const MAIN_GAME_TUTORIAL_STEPS: TutorialStep[] = [
  {
    title: 'Welcome to Byte Factory!',
    body:
      'This quick tour shows you around the level screen. Use the arrows (or the ← → keys) to move between pages, or press Skip any time.',
  },
  {
    title: 'Back to the roadmap',
    body: 'This button takes you back to the roadmap, where you can pick a different level.',
    target: 'back',
    arrow: 'bottom',
  },
  {
    title: 'Your mission',
    body:
      'The level title and instructions tell you what the robot has to do. Watch the block limit: your program can not use more blocks than that.',
    target: 'info',
    arrow: 'bottom',
  },
  {
    title: 'The toolbox',
    body:
      'Blocks are sorted into categories like Movement, Actions, Sensing, Logic and Loops. Click a category to open it and see its blocks.',
    target: 'toolbox',
    arrow: 'right',
  },
  {
    title: 'Build your program',
    body:
      'Drag blocks into the workspace and snap them together under each other. The robot runs them from top to bottom.',
    target: 'workspace',
    arrow: 'right',
  },
  {
    title: 'The factory floor',
    body: 'This is the robot’s world. Get the robot to the goal marker without bumping into walls.',
    target: 'grid',
    arrow: 'left',
  },
  {
    title: 'Run it!',
    body:
      'Press Run to start your program. The robot moves one step at a time and the block it is running lights up.',
    target: 'run',
    arrow: 'top',
  },
  {
    title: 'Start over',
    body:
      'Reset Robot puts the robot back at the start. Reset Blocks clears your work and brings back the level’s starting blocks.',
    target: 'resets',
    arrow: 'top',
  },
  {
    title: 'Save your work',
    body:
      'Your blocks are saved automatically. Export Save downloads them as a file, and Import Save loads a file back in.',
    target: 'saves',
    arrow: 'top',
  },
  {
    title: 'Messages & code',
    body:
      'Status messages show here (green when you win, red when something is wrong), along with the JavaScript your blocks turn into.',
    target: 'code',
    arrow: 'left',
  },
  {
    title: 'You’re ready!',
    body: 'Pick the first level on the roadmap to get started. Good luck!',
  },
];
