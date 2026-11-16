import * as Blockly from 'blockly';
import {javascriptGenerator} from 'blockly/javascript';

import {forBlock as moveGeneration} from './generators/moveGeneration';
import {actionBlock as actionGeneration} from './generators/actionGeneration';
import {sensorBlock as sensorGeneration} from './generators/sensorGeneration';
import './blocks/movement';
import './blocks/actions';
import './blocks/sensors';
import './index.css';

import {toolbox} from './toolbox';
import {generateCode, runCode} from './interpreter/interpreter';
import {GridView} from './animation/GridView';
import {TracePlayer} from './animation/TracePlayer';
import {Validator} from './validator/validator';
import {demoLevel, demoMap} from './levels/demo';
import {SaveController} from './saves/saveController';

Object.assign(javascriptGenerator.forBlock, moveGeneration);
Object.assign(javascriptGenerator.forBlock, actionGeneration);
Object.assign(javascriptGenerator.forBlock, sensorGeneration);

const codeDiv = document.getElementById('generatedCode')?.firstChild;
const statusEl = document.getElementById('status');
const blocklyDiv = document.getElementById('blocklyDiv');
const gameDiv = document.getElementById('gameCanvas') as HTMLDivElement | null;
const runButton = document.getElementById('runButton') as HTMLButtonElement | null;
const resetButton = document.getElementById('resetButton') as HTMLButtonElement | null;
const resetBlocksButton = document.getElementById('resetBlocksButton') as HTMLButtonElement | null;
const exportButton = document.getElementById('exportButton') as HTMLButtonElement | null;
const importButton = document.getElementById('importButton') as HTMLButtonElement | null;
const importFileInput = document.getElementById('importFileInput') as HTMLInputElement | null;

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

const showCode = () => {
  if (codeDiv) codeDiv.textContent = javascriptGenerator.workspaceToCode(ws);
};

const workspaceCtrl = new SaveController(ws, demoLevel, showCode);

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

resetBlocksButton?.addEventListener('click', () => {
  if (!window.confirm('Reset all blocks for this level back to the starting state?')) return;
  player.stop();
  workspaceCtrl.resetBlocks();
  view.reset(demoMap.start);
  if (runButton) runButton.disabled = false;
  setStatus('Blocks reset to default.', 'info');
});

exportButton?.addEventListener('click', () => {
  const levelId = workspaceCtrl.exportSave();
  setStatus(`Exported save for "${levelId}".`, 'info');
});

importButton?.addEventListener('click', () => importFileInput?.click());

importFileInput?.addEventListener('change', async () => {
  const file = importFileInput.files?.[0];
  if (!file) return;

  player.stop();
  const result = await workspaceCtrl.importSave(file);
  setStatus(
    result.ok ? 'Save file imported successfully.' : result.message,
    result.ok ? 'success' : 'error',
  );
  importFileInput.value = '';
});

// Boot initial level
workspaceCtrl.loadLevel(demoLevel);
setStatus('Press Run to start.');