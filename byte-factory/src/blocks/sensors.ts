import * as Blockly from 'blockly/core';

Blockly.defineBlocksWithJsonArray([
    {
        type:'path_clear_right',
        message0: 'Right block clear',
        output: 'Boolean',
        colour: 120,
        tooltip: 'Check if block to right is clear',
        helpUrl: '',
    },
    {
        type:'path_clear_left',
        message0: 'Left block clear',
        output: 'Boolean',
        colour: 120,
        tooltip: 'Check if block to left is clear',
        helpUrl: '',
    },
    {
        type:'path_clear_up',
        message0: 'Up block clear',
        output: 'Boolean',
        colour: 120,
        tooltip: 'Check if block up is clear',
        helpUrl: '',
    },
    {
        type:'path_clear_down',
        message0: 'Down block clear',
        output: 'Boolean',
        colour: 120,
        tooltip: 'Check if block down is clear',
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