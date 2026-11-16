/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as Blockly from 'blockly';

import {forBlock as moveGeneration} from './generators/moveGeneration';
import {actionBlock as actionGeneration} from './generators/actionGeneration';
import {sensorBlock as sensorGeneration} from './generators/sensorGeneration';

import {javascriptGenerator} from 'blockly/javascript';
import {save, load, clearSave} from './serialization';
import {toolbox} from './toolbox';
import './index.css';

import './blocks/movement';
import './blocks/actions';
import './blocks/sensors';

import {generateCode, runCode} from './interpreter/interpreter';
import {GridView} from './animation/GridView';
import {TracePlayer} from './animation/TracePlayer';
import {Validator} from './validator/validator';
import {demoLevel, demoMap} from './levels/demo';

// Register the blocks and generator with Blockly
Object.assign(javascriptGenerator.forBlock, moveGeneration);
Object.assign(javascriptGenerator.forBlock, actionGeneration);
Object.assign(javascriptGenerator.forBlock, sensorGeneration);

// Set up UI elements and inject Blockly
const codeDiv = document.getElementById('generatedCode')?.firstChild;
const statusEl = document.getElementById('status');
const blocklyDiv = document.getElementById('blocklyDiv');
const gameDiv = document.getElementById('gameCanvas') as HTMLDivElement | null;
const runButton = document.getElementById('runButton') as HTMLButtonElement | null;
const resetButton = document.getElementById('resetButton') as HTMLButtonElement | null;

if (!blocklyDiv || !gameDiv) {
  throw new Error(`div with id 'blocklyDiv' or 'gameCanvas' not found`);
}

const ws = Blockly.inject(blocklyDiv, {toolbox});

const view = new GridView(gameDiv, demoMap);
const player = new TracePlayer(view);
const validator = new Validator();

// Tracks active level and prevents auto-save from firing mid-load/switch
let activeLevel = demoLevel;
let isLoadingLevel = false;

const setStatus = (text: string, tone: 'info' | 'success' | 'error' = 'info') => {
  if (!statusEl) return;
  statusEl.textContent = text;
  statusEl.className = tone;
};

// Show the generated code (without the interpreter's tracking calls).
const showCode = () => {
  if (codeDiv) codeDiv.textContent = javascriptGenerator.workspaceToCode(ws);
};

// Loads a level into the workspace, preferring saved blocks over default startState
const loadLevelWorkspace = (level: typeof demoLevel, useSaved = true) => {
  isLoadingLevel = true;
  try {
    player.stop();
    ws.highlightBlock(null);
    ws.clear();

    const loadedFromSave = useSaved && load(ws, level.id ?? 'demo');
    if (!loadedFromSave && 'startState' in level && level.startState) {
      Blockly.serialization.workspaces.load(level.startState as object, ws);
    }

    ws.clearUndo();
    activeLevel = level;
    showCode();
    setStatus('Press Run to start.');
  } finally {
    isLoadingLevel = false;
  }
};

// Validate -> interpret into a trace -> animate the trace, highlighting each block.
const run = async () => {
  player.stop();
  const validation = validator.validate(ws, activeLevel);
  if (!validation.ok) {
    if (validation.blockId) ws.getBlockById(validation.blockId)?.select();
    setStatus(validation.message, 'error');
    return;
  }

  const result = runCode(generateCode(ws), demoMap);
  setStatus('Running...');
  if (runButton) runButton.disabled = true;

  const playback = await player.play(result.trace, demoMap.start, {
    onStep: (step) => ws.highlightBlock(step.blockId),
  });

  ws.highlightBlock(null);
  if (runButton) runButton.disabled = false;
  if (playback === 'stopped') return;
  setStatus(result.message, result.outcome === 'reached_goal' ? 'success' : 'error');
};

// Resets the robot/animation on the grid (keeps player's blocks intact)
const reset = () => {
  player.stop();
  ws.highlightBlock(null);
  view.reset(demoMap.start);
  if (runButton) runButton.disabled = false;
  setStatus('Press Run to start.');
};

const resetBlocks = () => {
  const levelId = activeLevel.id ?? 'demo';
  clearSave(levelId);
  loadLevelWorkspace(activeLevel, false);
};

runButton?.addEventListener('click', () => void run());
resetButton?.addEventListener('click', reset);

// Keep the generated code panel up to date AND auto-save
ws.addChangeListener((e: Blockly.Events.Abstract) => {
  if (
    isLoadingLevel ||
    e.isUiEvent ||
    e.type === Blockly.Events.FINISHED_LOADING ||
    ws.isDragging()
  ) {
    return;
  }
  showCode();
  save(ws, activeLevel.id ?? 'demo');
});

// Initial level boot
loadLevelWorkspace(demoLevel);