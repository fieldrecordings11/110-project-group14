import * as Blockly from 'blockly/core';
import { javascriptGenerator, Order } from 'blockly/javascript';
import { Direction } from './const';

export const sensorBlock = Object.create(null);

// defines the javascript code for checking if the next block is clear
// checkClear returns boolean
// 0 = up, 1 = down, 2 = right, 3 = left

sensorBlock['path_clear_up'] = function (
    block: Blockly.Block,
    generator: Blockly.CodeGenerator,
) {
    return [`checkClear(${Direction.UP})`, Order.ATOMIC];
};

sensorBlock['path_clear_down'] = function (
    block: Blockly.Block,
    generator: Blockly.CodeGenerator,
) {
    return [`checkClear(${Direction.DOWN})`, Order.ATOMIC];
};

sensorBlock['path_clear_right'] = function (
    block: Blockly.Block,
    generator: Blockly.CodeGenerator,
) {
    return [`checkClear(${Direction.RIGHT})`, Order.ATOMIC];
};

sensorBlock['path_clear_left'] = function (
    block: Blockly.Block,
    generator: Blockly.CodeGenerator,
) {
    return [`checkClear(${Direction.LEFT})`, Order.ATOMIC];
};

// checkPuddle returns true when the next tile in that direction is a puddle
sensorBlock['puddle_up'] = function (
    block: Blockly.Block,
    generator: Blockly.CodeGenerator,
) {
    return [`checkPuddle(${Direction.UP})`, Order.ATOMIC];
};

sensorBlock['puddle_down'] = function (
    block: Blockly.Block,
    generator: Blockly.CodeGenerator,
) {
    return [`checkPuddle(${Direction.DOWN})`, Order.ATOMIC];
};

sensorBlock['puddle_right'] = function (
    block: Blockly.Block,
    generator: Blockly.CodeGenerator,
) {
    return [`checkPuddle(${Direction.RIGHT})`, Order.ATOMIC];
};

sensorBlock['puddle_left'] = function (
    block: Blockly.Block,
    generator: Blockly.CodeGenerator,
) {
    return [`checkPuddle(${Direction.LEFT})`, Order.ATOMIC];
};

sensorBlock['is_holding_item'] = function (
    block: Blockly.Block,
    generator: Blockly.CodeGenerator,
) {
    return ['checkHolding()', Order.ATOMIC];
};

sensorBlock['on_finish_grid'] = function (
    block: Blockly.Block,
    generator: Blockly.CodeGenerator,
) {
    return ['checkFinish()', Order.ATOMIC];
};