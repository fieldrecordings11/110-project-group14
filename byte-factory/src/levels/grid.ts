import { Position } from '../interpreter/types';

/** Every tile of a width x height grid that isn't in `open`, as walls. Handy for corridor-shaped levels. */
export function wallsExcept(width: number, height: number, open: Position[]): Position[] {
  const walls: Position[] = [];
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (!open.some((tile) => tile.x === x && tile.y === y)) walls.push({ x, y });
    }
  }
  return walls;
}
