import * as Blockly from 'blockly/core';

export const actionBlock = Object.create(null);

actionBlock['pick_up'] = function (
    block: Blockly.Block,
    generator: Blockly.CodeGenerator,
) {
    return 'pickUp();\n';
};

actionBlock['put_down'] = function (
    block: Blockly.Block,
    generator: Blockly.CodeGenerator,
) {
    return 'putDown();\n';
};

actionBlock['toggle'] = function (
    block: Blockly.Block,
    generator: Blockly.CodeGenerator,
) {
    return 'toggleSwitch();\n';
};