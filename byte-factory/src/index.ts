/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as Blockly from 'blockly';
import {forBlock as moveGeneration} from './generators/moveGeneration';
import {javascriptGenerator} from 'blockly/javascript';
import {toolbox} from './toolbox';
import './index.css';
import './blocks/movement';
import {generateCode, runCode} from './interpreter/interpreter';
import {GridView} from './animation/GridView';
import {TracePlayer} from './animation/TracePlayer';
import {Validator} from './validator/validator';
import {demoLevel, demoMap} from './levels/demo';

// Register the blocks and generator with Blockly
Object.assign(javascriptGenerator.forBlock, moveGeneration);

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

const setStatus = (text: string, tone: 'info' | 'success' | 'error' = 'info') => {
  if (!statusEl) return;
  statusEl.textContent = text;
  statusEl.className = tone;
};

// Show the generated code (without the interpreter's tracking calls).
const showCode = () => {
  if (codeDiv) codeDiv.textContent = javascriptGenerator.workspaceToCode(ws);
};

// Validate -> interpret into a trace -> animate the trace, highlighting each block.
const run = async () => {
  player.stop();
  const validation = validator.validate(ws, demoLevel);
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

const reset = () => {
  player.stop();
  ws.highlightBlock(null);
  view.reset(demoMap.start);
  if (runButton) runButton.disabled = false;
  setStatus('Press Run to start.');
};

runButton?.addEventListener('click', () => void run());
resetButton?.addEventListener('click', reset);

if (ws) {
  showCode();
  setStatus('Press Run to start.');

  // Keep the generated code panel up to date.
  ws.addChangeListener((e: Blockly.Events.Abstract) => {
    if (e.isUiEvent || e.type == Blockly.Events.FINISHED_LOADING || ws.isDragging()) {
      return;
    }
    showCode();
  });
}
