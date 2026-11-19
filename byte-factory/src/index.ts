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
import type { MinigameEntry } from './screens/hub';
import { loadRoadmapProgress, saveRoadmapProgress } from './screens/roadmap-progress';

// App flow: main menu -> roadmap -> a level or the Hangman minigame -> back to the roadmap.
const root = document.getElementById('app');
if (!root) {
  throw new Error(`div with id 'app' not found`);
}

// Minigames on either side of the roadmap: [left] <- you -> [right].
const leftMinigame: MinigameEntry = {
  id: 'trivia',
  title: 'Trivia',
  blurb: 'Coming soon',
  icon: '🎲',
  available: false,
};
const rightMinigame: MinigameEntry = {
  id: 'hangman',
  title: 'Hangman',
  blurb: 'Spell out the coding words',
  icon: '🔤',
  available: true,
};

const app = new ScreenManager(root);
const hangman = new HangmanMinigame();
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

const showMenu = () => app.show(new MenuScreenController(showRoadmap, openHangmanFromMenu));

const openHangmanFromRoadmap = () => {
  const entry = ROADMAP_ENTRIES.find((e) => e.kind === 'hangman');
  if (!entry || entry.kind !== 'hangman') return;

  hangman.open(entry.questionsFor, (result) => {
    if (result.finished) markComplete(entry.id);
    showRoadmap();
  });
};

// The middle of the roadmap only lists levels (Hangman sits beside it), numbered 1, 2, 3...
const showRoadmap = () => {
  const levelStops = ROADMAP_ENTRIES.filter((stop) => stop.kind === 'level');
  const levels = toRoadmapLevels(levelStops, completedIds).map((level, index) => ({
    ...level,
    id: String(index + 1),
  }));
  app.show(
    new RoadmapScreen({
      levels,
      left: leftMinigame,
      right: rightMinigame,
      onSelectLevel: (number) => {
        const stop = levelStops[Number(number) - 1];
        if (stop) openEntry(stop.id);
      },
      onSelectMinigame: (minigameId) => {
        if (minigameId === 'hangman') openHangmanFromRoadmap();
      },
      onBack: showMenu,
    }),
  );
};

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
