import {describe, expect, it} from 'vitest';
import {campaign} from '../levels/campaign';
import type {GridMap} from '../interpreter/types';

/** True if the robot can walk from the start to the goal without crossing a wall. */
function canReachGoal(map: GridMap): boolean {
  const walls = new Set(map.walls.map((w) => `${w.x},${w.y}`));
  const seen = new Set([`${map.start.x},${map.start.y}`]);
  const queue = [map.start];
  while (queue.length > 0) {
    const {x, y} = queue.shift()!;
    if (x === map.goal.x && y === map.goal.y) return true;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = x + dx;
      const ny = y + dy;
      const key = `${nx},${ny}`;
      const inside = nx >= 0 && ny >= 0 && nx < map.width && ny < map.height;
      if (inside && !walls.has(key) && !seen.has(key)) {
        seen.add(key);
        queue.push({x: nx, y: ny});
      }
    }
  }
  return false;
}

describe('campaign levels', () => {
  it('has at least one level', () => {
    expect(campaign.length).toBeGreaterThan(0);
  });

  it('gives every level a different id', () => {
    const ids = campaign.map((entry) => entry.level.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('lets the robot reach the goal on every level', () => {
    for (const entry of campaign) {
      expect(canReachGoal(entry.map), entry.level.id).toBe(true);
    }
  });
});
