/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import './index.css';
import { ScreenManager } from './app/ScreenManager';
import { ROADMAP_ENTRIES, toRoadmapLevels } from './app/roadmapEntries';
import { HangmanMinigame } from './hangman/HangmanMinigame';
import { LevelScreen } from './screens/level/LevelScreen';
import { MenuScreenController } from './screens/menu/MenuScreenController';
import { RoadmapScreen } from './screens/RoadmapScreen';
import { loadRoadmapProgress, saveRoadmapProgress } from './screens/roadmap-progress';

// App flow: main menu -> roadmap -> a level or the Hangman minigame -> back to the roadmap.
const root = document.getElementById('app');
if (!root) {
  throw new Error(`div with id 'app' not found`);
}

const app = new ScreenManager(root);
const hangman = new HangmanMinigame();
let completedIds = loadRoadmapProgress();

const markComplete = (id: string) => {
  if (completedIds.indexOf(id) !== -1) return;
  completedIds = [...completedIds, id];
  saveRoadmapProgress(completedIds);
};

const showMenu = () => app.show(new MenuScreenController(showRoadmap));

const showRoadmap = () =>
  app.show(
    new RoadmapScreen({
      levels: toRoadmapLevels(ROADMAP_ENTRIES, completedIds),
      onSelectLevel: openEntry,
      onBack: showMenu,
    }),
  );

const openEntry = (id: string) => {
  const entry = ROADMAP_ENTRIES.find((e) => e.id === id);
  if (!entry) return;

  if (entry.kind === 'level') {
    app.show(
      new LevelScreen({
        title: entry.title,
        level: entry.level,
        map: entry.map,
        onComplete: () => markComplete(entry.id),
        onExit: showRoadmap,
      }),
    );
  } else {
    // Hangman opens on top of the roadmap; redraw the roadmap afterwards so it unlocks the next stop.
    hangman.open(entry.questionsFor, (result) => {
      if (result.finished) markComplete(entry.id);
      showRoadmap();
    });
  }
};

showMenu();
