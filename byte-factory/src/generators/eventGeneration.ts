import * as Blockly from 'blockly/core';

export const eventBlock = Object.create(null);

// The hat does nothing itself; Blockly generates the blocks attached below it.
eventBlock['start'] = function (
    block: Blockly.Block,
    generator: Blockly.CodeGenerator,
) {
    return '';
};
