/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {Order} from 'blockly/javascript';
import * as Blockly from 'blockly/core';

// Export all the code generators for our custom blocks,
// but don't register them with Blockly yet.
// This file has no side effects!
export const forBlock = Object.create(null);


// defines the javascript code for the movement blocks by calling move()
// 0 = up, 1 = down, 2 = right, 3 = left
forBlock['move_up'] = function (
    block: Blockly.Block,
    generator: Blockly.CodeGenerator,
) {
    return 'move(0);\n';
};

forBlock['move_down'] = function (
    block: Blockly.Block,
    generator: Blockly.CodeGenerator,
) {
    return 'move(1);\n';
};

forBlock['move_right'] = function (
    block: Blockly.Block,
    generator: Blockly.CodeGenerator,
) {
    return 'move(2);\n';
};

forBlock['move_left'] = function (
    block: Blockly.Block,
    generator: Blockly.CodeGenerator,
) {
    return 'move(3);\n';
};