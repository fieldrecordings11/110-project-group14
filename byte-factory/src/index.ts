/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import './index.css';
import { ScreenManager } from './app/ScreenManager';
import { ROADMAP_ENTRIES, getEntryLevel, toRoadmapLevels } from './app/roadmapEntries';
import { HangmanMinigame } from './hangman/HangmanMinigame';
import { LevelScreen } from './screens/level/LevelScreen';
import { MenuScreenController } from './screens/menu/MenuScreenController';
import { RoadmapScreen } from './screens/RoadmapScreen';
import { loadRoadmapProgress, saveRoadmapProgress } from './screens/roadmap-progress';
import { MainGameTutorial, shouldShowMainGameTutorial } from './tutorial/MainGameTutorial';

// App flow: main menu -> roadmap -> a level or the Hangman minigame -> back to the roadmap.
const root = document.getElementById('app');
if (!root) {
  throw new Error(`div with id 'app' not found`);
}

const app = new ScreenManager(root);
const hangman = new HangmanMinigame();
const tutorial = new MainGameTutorial();
let completedIds = loadRoadmapProgress();

const markComplete = (id: string) => {
  if (completedIds.indexOf(id) !== -1) return;
  completedIds = [...completedIds, id];
  saveRoadmapProgress(completedIds);
};

const openHangmanFromMenu = () => {
  // Reuse the Hangman entry that already exists on the roadmap
  const entry = ROADMAP_ENTRIES.find((e) => e.kind !== 'level');
  if (!entry) return;

  hangman.open(entry.questionsFor, () => showMenu());
};

// Main Game opens the roadmap with the level-screen tutorial popped up on top of it.
const startMainGame = () => {
  showRoadmap();
  if (shouldShowMainGameTutorial()) tutorial.open();
};

const showMenu = () => app.show(new MenuScreenController(startMainGame, openHangmanFromMenu));

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
    const gameLevels = ROADMAP_ENTRIES.filter((stop) => stop.kind === 'level');
    const currentIndex = gameLevels.findIndex((stop) => stop.id === id);
    const nextEntry = gameLevels[currentIndex + 1];

    let onContinue: (() => void) | undefined;

    if (nextEntry) {
      onContinue = () => {
        openEntry(nextEntry.id);
      }
    }
    app.show(
      new LevelScreen({
        level: getEntryLevel(entry.levelId),
        onComplete: () => markComplete(entry.id),
        onExit: showRoadmap,
        onContinue: onContinue
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
