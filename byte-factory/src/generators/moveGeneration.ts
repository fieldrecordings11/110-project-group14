/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as Blockly from 'blockly/core';
import { Direction } from './const';

export const forBlock = Object.create(null);



// defines the javascript code for the movement blocks by calling move()
// 0 = up, 1 = down, 2 = right, 3 = left
forBlock['move_up'] = function (
    block: Blockly.Block,
    generator: Blockly.CodeGenerator,
) {
    return 'move(Direction.UP);\n';
};

forBlock['move_down'] = function (
    block: Blockly.Block,
    generator: Blockly.CodeGenerator,
) {
    return 'move(Direction.DOWN);\n';
};

forBlock['move_right'] = function (
    block: Blockly.Block,
    generator: Blockly.CodeGenerator,
) {
    return 'move(Direction.RIGHT);\n';
};

forBlock['move_left'] = function (
    block: Blockly.Block,
    generator: Blockly.CodeGenerator,
) {
    return 'move(Direction.LEFT);\n';
};