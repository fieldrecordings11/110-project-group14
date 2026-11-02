import * as Blockly from 'blockly/core';

Blockly.defineBlocksWithJsonArray([
    {
        type:'path_clear_right',
        message0: 'Right tile clear',
        output: 'Boolean',
        colour: 120,
        tooltip: 'Check if tile to right is clear',
        helpUrl: '',
    },
    {
        type:'path_clear_left',
        message0: 'Left tile clear',
        output: 'Boolean',
        colour: 120,
        tooltip: 'Check if tile to left is clear',
        helpUrl: '',
    },
    {
        type:'path_clear_up',
        message0: 'Up tile clear',
        output: 'Boolean',
        colour: 120,
        tooltip: 'Check if tile up is clear',
        helpUrl: '',
    },
    {
        type:'path_clear_down',
        message0: 'Down tile clear',
        output: 'Boolean',
        colour: 120,
        tooltip: 'Check if tile down is clear',
        helpUrl: '',
    },
    {
        type:'is_holding_item',
        message0: 'Check holding item',
        output: 'Boolean',
        colour: 120,
        tooltip: 'Check if robot is holding item',
        helpUrl: '',
    },
    {
        type:'on_finish_grid',
        message0: 'Standing on finish',
        output: 'Boolean',
        colour: 120,
        tooltip: 'Check if standing on finish block',
        helpUrl: '',
    },
]);