/**
 * Starting workspace for a level: just the "when RUN pressed" block (blocks/events.ts),
 * which the player can't delete. Use as a level's startState.
 */
export const startBlockState = {
  blocks: {
    languageVersion: 0,
    blocks: [{ type: 'start', x: 20, y: 20, deletable: false }],
  },
};
