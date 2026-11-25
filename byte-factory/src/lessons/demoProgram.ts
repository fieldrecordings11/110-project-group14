type BlockJson = Record<string, unknown>;

/**
 * A demo's workspace: the "when RUN pressed" block with the given blocks stacked under it,
 * top to bottom. Strings are block types; objects are full block JSON (e.g. a loop with a body).
 */
export function demoProgram(...blocks: (string | BlockJson)[]): object {
  let next: BlockJson | undefined;
  for (const block of [...blocks].reverse()) {
    const json: BlockJson = typeof block === 'string' ? { type: block } : { ...block };
    if (next) json.next = { block: next };
    next = json;
  }
  const start: BlockJson = { type: 'start', x: 20, y: 20 };
  if (next) start.next = { block: next };
  return { blocks: { languageVersion: 0, blocks: [start] } };
}
