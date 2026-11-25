/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import './index.css';
import { ScreenManager } from './app/ScreenManager';
import { ROADMAP_ENTRIES, getEntryLevel, toRoadmapLevels } from './app/roadmapEntries';
import { HangmanMinigame } from './hangman/HangmanMinigame';
import { getLesson } from './lessons';
import { LevelScreen } from './screens/level/LevelScreen';
import { LevelPreviewScreen } from './screens/preview/LevelPreviewScreen';
import { MenuScreenController } from './screens/menu/MenuScreenController';
import { RoadmapScreen } from './screens/RoadmapScreen';
import { loadRoadmapProgress, saveRoadmapProgress } from './screens/roadmap-progress';
import { TriviaMinigame } from './trivia/trivia';

// App flow: main menu -> roadmap -> a level (after its lesson) or the Hangman minigame -> back to the roadmap.
const root = document.getElementById('app');
if (!root) {
  throw new Error(`div with id 'app' not found`);
}

const app = new ScreenManager(root);
const hangman = new HangmanMinigame();
const trivia = new TriviaMinigame();
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

const openTriviaFromMenu = () => trivia.open();

const showMenu = () => app.show(new MenuScreenController(showRoadmap, openHangmanFromMenu, openTriviaFromMenu));

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
    const level = getEntryLevel(entry.levelId);
    const startLevel = () =>
      app.show(
        new LevelScreen({
          level,
          onComplete: () => markComplete(entry.id),
          onExit: showRoadmap,
          onContinue: onContinue
        }),
      );

    // Show the level's lesson first, if it has one.
    const lesson = getLesson(level.id);
    if (lesson && lesson.pages.length > 0) {
      app.show(
        new LevelPreviewScreen({
          level,
          levelNumber: currentIndex + 1,
          lesson,
          onStart: startLevel,
          onBack: showRoadmap,
        }),
      );
    } else {
      startLevel();
    }
  } else {
    // Hangman opens on top of the roadmap; redraw the roadmap afterwards so it unlocks the next stop.
    hangman.open(entry.questionsFor, (result) => {
      if (result.finished) markComplete(entry.id);
      showRoadmap();
    });
  }
};

showMenu();
