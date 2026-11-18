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