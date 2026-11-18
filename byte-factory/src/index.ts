/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import './index.css';
import {campaign, findCampaignLevel} from './levels/campaign';
import {LevelScreen} from './game/levelScreen';
import {showHub} from './screens/hub';
import type {MinigameEntry} from './screens/hub';
import {loadRoadmapProgress, saveRoadmapProgress} from './screens/roadmap-progress';
import {HangmanMinigame} from './hangman/HangmanMinigame';

// Minigames on either side of the level map: [left] <- you -> [right].
const leftMinigame: MinigameEntry = {
  id: 'minigame-2',
  title: 'Minigame',
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

const hubScreen = document.getElementById('hubScreen');
const levelScreenEl = document.getElementById('levelScreen');
if (!hubScreen || !levelScreenEl) {
  throw new Error(`div with id 'hubScreen' or 'levelScreen' not found`);
}

let completedLevelIds = loadRoadmapProgress();
let destroyHub: (() => void) | undefined;
const hangman = new HangmanMinigame();

/** Hangman asks the questions of the level the player is working on now. */
function currentLevelId(): string {
  const next = campaign.find((entry) => completedLevelIds.indexOf(entry.level.id) === -1);
  return (next ?? campaign[campaign.length - 1]).level.id;
}

function showHubScreen(): void {
  destroyHub?.();
  levelScreen.close();
  hubScreen!.hidden = false;
  destroyHub = showHub(hubScreen!, {
    levels: campaign.map((entry) => ({id: entry.level.id, title: entry.title})),
    completedLevelIds,
    left: leftMinigame,
    right: rightMinigame,
    onSelectLevel: (levelId) => {
      const entry = findCampaignLevel(levelId);
      if (!entry) return;
      destroyHub?.();
      destroyHub = undefined;
      hubScreen!.hidden = true;
      levelScreen.open(entry);
    },
    onSelectMinigame: (minigameId) => {
      if (minigameId === 'hangman') hangman.open(currentLevelId());
    },
  });
}

const levelScreen = new LevelScreen(levelScreenEl, {
  onExit: showHubScreen,
  onComplete: (levelId) => {
    if (completedLevelIds.indexOf(levelId) === -1) {
      completedLevelIds = [...completedLevelIds, levelId];
    }
    return saveRoadmapProgress(completedLevelIds);
  },
});

showHubScreen();
import { ScreenManager } from './app/ScreenManager';
import { ROADMAP_ENTRIES, getEntryLevel, toRoadmapLevels } from './app/roadmapEntries';
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

const openHangmanFromMenu = () => {
  // Reuse the Hangman entry that already exists on the roadmap
  const entry = ROADMAP_ENTRIES.find((e) => e.kind !== 'level');
  if (!entry) return;

  hangman.open(entry.questionsFor, () => showMenu());
};

const showMenu = () => app.show(new MenuScreenController(showRoadmap, openHangmanFromMenu));

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
