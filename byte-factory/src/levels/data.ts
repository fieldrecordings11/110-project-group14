import { conditionalsLevel } from './conditionals';
import { loopsLevel } from './loops';
import { sequencingLevel } from './sequencing';
import { Level } from './types';

export const levels: Level[] = [sequencingLevel, loopsLevel, conditionalsLevel];
