const storageKey = 'byteFactory.roadmap.completedLevels';

/** Invalid or unavailable browser storage starts with no completed levels. */
export function loadRoadmapProgress(): string[] {
  try {
    const saved: unknown = JSON.parse(window.localStorage.getItem(storageKey) || '[]');
    if (!Array.isArray(saved) || !saved.every((id) => typeof id === 'string')) {
      return [];
    }
    return saved.filter((id, index) => saved.indexOf(id) === index);
  } catch {
    return [];
  }
}

/** Returns false when progress could not be persisted; callers can keep it in memory. */
export function saveRoadmapProgress(completedLevelIds: readonly string[]): boolean {
  try {
    window.localStorage.setItem(storageKey, JSON.stringify(completedLevelIds));
    return true;
  } catch {
    return false;
  }
}
