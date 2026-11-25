import { describe, it, expect } from 'vitest';
import * as Blockly from 'blockly/core';
import './helpers'; // English messages + movement and sensor blocks
import '../blocks/events';
import { runWorkspace } from '../interpreter/interpreter';
import { getLesson } from '../lessons';
import { conditionalsLesson } from '../lessons/conditionals';
import { demoProgram } from '../lessons/demoProgram';
import { loopsLesson } from '../lessons/loops';
import { sequencingLesson } from '../lessons/sequencing';
import { LessonDemo } from '../lessons/types';
import { levelRegistry } from '../levels';
import { levels } from '../levels/data';

const lessons = [sequencingLesson, loopsLesson, conditionalsLesson];

/** [level id, demo] for every example page. */
const examples: [string, LessonDemo][] = [];
for (const lesson of lessons) {
  for (const page of lesson.pages) {
    if (page.kind === 'example') examples.push([lesson.levelId, page.demo]);
  }
}

function loadDemo(blocks: object): Blockly.Workspace {
  const workspace = new Blockly.Workspace();
  Blockly.serialization.workspaces.load(blocks, workspace);
  return workspace;
}

function runDemo(demo: LessonDemo) {
  const workspace = loadDemo(demo.blocks);
  const result = runWorkspace(workspace, demo.map);
  workspace.dispose();
  return result;
}

describe('lessons', () => {
  it('getLesson returns the lesson for a known level id', () => {
    expect(getLesson('sequencing')).toBe(sequencingLesson);
  });

  it('getLesson returns undefined for a level with no lesson', () => {
    expect(getLesson('no-such-level')).toBeUndefined();
  });

  it('gives every level a lesson with pages', () => {
    for (const level of levels) {
      expect(getLesson(level.id)?.pages.length).toBeGreaterThan(0);
    }
  });

  it('gives every lesson an example page', () => {
    for (const lesson of lessons) {
      expect(lesson.pages.some((page) => page.kind === 'example')).toBe(true);
    }
  });

  it.each(examples)('the %s demo only uses blocks its level allows', (levelId, demo) => {
    const allowed = levelRegistry.get(levelId)!.allowedBlocks;
    const workspace = loadDemo(demo.blocks);
    const types = workspace.getAllBlocks(false).map((block) => block.type);
    workspace.dispose();

    expect(types[0]).toBe('start');
    for (const type of types.slice(1)) {
      expect(allowed).toContain(type);
    }
  });

  it.each(examples)('the %s demo reaches its goal', (_levelId, demo) => {
    expect(runDemo(demo).outcome).toBe('reached_goal');
  });

  it('the sequencing demo bumps the wall if the moves are reordered, as its caption says', () => {
    const [, demo] = examples.find(([levelId]) => levelId === 'sequencing')!;
    const reordered = { ...demo, blocks: demoProgram('move_right', 'move_down', 'move_right', 'move_right') };
    expect(runDemo(reordered).outcome).toBe('hit_wall');
  });
});
