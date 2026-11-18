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
