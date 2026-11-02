import {getLevelStatus, showRoadmap} from './roadmap';
import type {RoadmapLevel} from './roadmap';
import {loadRoadmapProgress, saveRoadmapProgress} from './roadmap-progress';

// Sample levels
const levels: RoadmapLevel[] = [
  {id: '1', title: 'First steps', status: 'available', y: 350},
  {id: '2', title: 'Repeat actions', status: 'locked', y: 220},
  {id: '3', title: 'Make decisions', status: 'locked', y: 90},
];

export function setupRoadmapPreview() {
  const container = document.getElementById('roadmap-preview');

  let completedLevelIds = loadRoadmapProgress();
  let selectedLevelId: string | undefined;
  let destroyRoadmap: (() => void) | undefined;
  const completeButton = document.getElementById('complete-preview-level') as HTMLButtonElement;
  const resetButton = document.getElementById('reset-preview-progress') as HTMLButtonElement;
  const previewStatus = document.getElementById('preview-status');

  function render() {
    if (!container) return;
    const levelsWithProgress = levels.map((level, index) => ({
      ...level,
      status: getLevelStatus(level.id, index, levels, completedLevelIds),
    }));
    destroyRoadmap = showRoadmap(container, levelsWithProgress, (levelId) => {
      selectedLevelId = levelId;
      completeButton.disabled = false;
      if (previewStatus) previewStatus.textContent = `Selected level ${levelId}. Use the preview button to simulate completing it.`;
    });
  }

  function saveAndRender() {
    const saved = saveRoadmapProgress(completedLevelIds);
    selectedLevelId = undefined;
    completeButton.disabled = true;
    render();
    if (previewStatus) previewStatus.textContent = saved
      ? 'Progress saved. Select an unlocked level to continue.'
      : 'Progress updated for this visit, but browser storage is unavailable.';
  }

  completeButton.addEventListener('click', () => {
    if (!selectedLevelId) return;
    if (completedLevelIds.indexOf(selectedLevelId) === -1) completedLevelIds.push(selectedLevelId);
    saveAndRender();
  });
  resetButton.addEventListener('click', () => {
    completedLevelIds = [];
    saveAndRender();
  });
  window.addEventListener('pagehide', () => destroyRoadmap?.());
  window.addEventListener('pageshow', (event) => {
    if (event.persisted) {
      completedLevelIds = loadRoadmapProgress();
      selectedLevelId = undefined;
      completeButton.disabled = true;
      render();
    }
  });
  render();
}

if (document.getElementById('roadmap-preview')) {
  setupRoadmapPreview();
}
