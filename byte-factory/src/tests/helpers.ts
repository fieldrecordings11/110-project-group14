import * as Blockly from 'blockly/core';
import 'blockly/blocks'; // built-in blocks: repeat, while, math_number, ...
import * as En from 'blockly/msg/en';
import '../blocks/movement'; // move_up / move_down / move_left / move_right

// The full 'blockly' import used by the app loads English messages; headless tests must do it.
Blockly.setLocale(En as unknown as { [key: string]: string });

type BlockJson = Record<string, unknown>;

/** A stack of blocks joined by `next`, e.g. stack('move_right', 'move_down'). */
export function stack(...blocks: (string | BlockJson)[]): BlockJson {
  const [first, ...rest] = blocks.map((b): BlockJson => (typeof b === 'string' ? { type: b } : { ...b }));
  let current = first;
  for (const block of rest) {
    current.next = { block };
    current = block;
  }
  return first;
}

export function repeat(times: number, body: BlockJson): BlockJson {
  return {
    type: 'controls_repeat_ext',
    inputs: {
      TIMES: { block: { type: 'math_number', fields: { NUM: times } } },
      DO: { block: body },
    },
  };
}

/** A headless workspace containing the given top-level stacks. */
export function workspaceWith(...topBlocks: BlockJson[]): Blockly.Workspace {
  const workspace = new Blockly.Workspace();
  Blockly.serialization.workspaces.load({ blocks: { languageVersion: 0, blocks: topBlocks } }, workspace);
  return workspace;
}
