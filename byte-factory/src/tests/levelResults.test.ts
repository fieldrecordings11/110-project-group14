// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { LevelScreen } from '../screens/level/LevelScreen';
import { runCode } from '../interpreter/interpreter';
import { Level } from '../levels/types';
import { GridMap } from '../interpreter/types';

const mocks = vi.hoisted(() => ({
  reset: vi.fn(),
  destroy: vi.fn(),
  stop: vi.fn(),
  play: vi.fn(async () => 'finished'),
  highlightBlock: vi.fn(),
  dispose: vi.fn(),
}));

// Keep Blockly's definitions, but avoid drawing a real workspace.
vi.mock('blockly', async (importOriginal) => {
  const actual = await importOriginal<typeof import('blockly')>();

  return {
    ...actual,
    inject: vi.fn(() => ({
      highlightBlock: mocks.highlightBlock,
      dispose: mocks.dispose,
      clear: vi.fn(),
      clearUndo: vi.fn(),
    })),
  };
});

vi.mock('../animation/GridView', () => ({
  fitTileSize: () => 48,
  GridView: class {
    reset = mocks.reset;
    destroy = mocks.destroy;
  },
}));

vi.mock('../animation/TracePlayer', () => ({
  TracePlayer: class {
    stop = mocks.stop;
    play = mocks.play;
  },
}));

vi.mock('../interpreter/interpreter', () => ({
  generateCode: vi.fn(() => ''),
  runCode: vi.fn(),
}));

vi.mock('../validator/validator', () => ({
  Validator: class {
    validate() {
      return { ok: true };
    }
  },
}));

vi.mock('../saves/saveController', () => ({
  SaveController: class {
    loadLevel() {}
  },
}));

const map: GridMap = {
  width: 2,
  height: 1,
  start: { x: 0, y: 0 },
  goal: { x: 1, y: 0 },
  walls: [],
};
const level: Level = {
  id: 'test-level', title: 'Test level', instructions: 'Move to the goal.',
  allowedBlocks: ['move_right'], blockLimit: 5, map: map,
};

describe('Level result dialog', () => {
  let root: HTMLDivElement;
  let screen: LevelScreen;
  const onComplete = vi.fn();
  const onExit = vi.fn();
  const onContinue = vi.fn();

  function mountScreen(hasNextLevel = true) {
    screen = new LevelScreen({
      level: level,
      onComplete: onComplete, onExit: onExit,
      onContinue: hasNextLevel ? onContinue : undefined,
    });
    screen.mount(root);
    // jsdom does not implement these browser dialog methods.
    const resultDialog = dialog();
    resultDialog.showModal = vi.fn(() => {
      resultDialog.open = true;
    });
    resultDialog.close = vi.fn(() => {
      resultDialog.open = false;
    });
  }

  function button(id: string): HTMLButtonElement {
    return root.querySelector(`#${id}`) as HTMLButtonElement;
  }

  function dialog(): HTMLDialogElement {
    return root.querySelector('#resultDialog') as HTMLDialogElement;
  }

  async function runProgram() {
    button('runButton').click();
    await vi.waitFor(() => expect(dialog().open).toBe(true));
  }

  beforeEach(() => {
    vi.clearAllMocks();
    mocks.play.mockResolvedValue('finished');
    vi.mocked(runCode).mockReturnValue({
      trace: [], outcome: 'reached_goal',
      message: 'You reached the goal!', finalPosition: map.goal,
    });
    root = document.createElement('div');
    document.body.appendChild(root);
    mountScreen();
  });

  afterEach(() => {
    screen.unmount();
    root.remove();
    vi.restoreAllMocks();
  });

  it('starts with the result dialog closed', () => {
    expect(dialog().open).toBe(false);
  });

  it('shows success feedback after reaching the goal', async () => {
    await runProgram();
    expect(root.querySelector('#resultTitle')?.textContent).toBe('Level complete! 🏆');
    expect(root.querySelector('#resultMessage')?.textContent).toBe('You reached the goal!');
    expect(button('replayButton').hidden).toBe(false);
    expect(button('keepEditingButton').hidden).toBe(true);
    expect(button('continueButton').hidden).toBe(false);
    expect(onComplete).toHaveBeenCalledOnce();
  });

  it('shows failure feedback without completing the level', async () => {
    vi.mocked(runCode).mockReturnValue({
      trace: [], outcome: 'hit_wall',
      message: 'The robot hit a wall.', finalPosition: map.start,
    });
    await runProgram();
    expect(root.querySelector('#resultTitle')?.textContent).toBe('Try again!');
    expect(root.querySelector('#resultMessage')?.textContent).toBe('The robot hit a wall.');
    expect(button('replayButton').hidden).toBe(true);
    expect(button('keepEditingButton').hidden).toBe(false);
    expect(button('continueButton').hidden).toBe(true);
    expect(onComplete).not.toHaveBeenCalled();
  });

  it('closes the dialog and resets the robot on Replay', async () => {
    await runProgram();
    button('replayButton').click();
    expect(dialog().open).toBe(false);
    expect(mocks.reset).toHaveBeenCalledWith(map.start);
    expect(root.querySelector('#status')?.textContent).toBe('Press Run to start.');
    expect(onExit).not.toHaveBeenCalled();
    expect(onContinue).not.toHaveBeenCalled();
  });

  it('closes failure feedback on Try Again', async () => {
    vi.mocked(runCode).mockReturnValue({
      trace: [], outcome: 'stopped_short',
      message: 'The robot stopped before the goal.', finalPosition: map.start,
    });
    await runProgram();
    button('keepEditingButton').click();
    expect(dialog().open).toBe(false);
    expect(onExit).not.toHaveBeenCalled();
    expect(onContinue).not.toHaveBeenCalled();
  });

  it('returns to the roadmap when its button is clicked', async () => {
    await runProgram();
    button('resultRoadmapButton').click();
    expect(dialog().open).toBe(false);
    expect(onExit).toHaveBeenCalledOnce();
  });

  it('calls the next-level action on Next Level', async () => {
    await runProgram();
    button('continueButton').click();
    expect(dialog().open).toBe(false);
    expect(onContinue).toHaveBeenCalledOnce();
  });

  it('hides Next Level when there is no next level', async () => {
    screen.unmount();
    mountScreen(false);
    await runProgram();
    expect(button('continueButton').hidden).toBe(true);
    expect(button('replayButton').hidden).toBe(false);
  });

  it('does not show results when playback is stopped', async () => {
    mocks.play.mockResolvedValueOnce('stopped');
    button('runButton').click();
    await vi.waitFor(() => expect(mocks.play).toHaveResolvedWith('stopped'));
    expect(dialog().open).toBe(false);
    expect(onComplete).not.toHaveBeenCalled();
  });
});
