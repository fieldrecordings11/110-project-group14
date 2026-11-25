import * as Blockly from 'blockly/core';

Blockly.defineBlocksWithJsonArray([
    {
        // The validator doesn't count 'start' toward a level's block limit.
        type:'start',
        message0: 'when RUN pressed',
        nextStatement: null,
        style: { hat: 'cap' },
        colour: '#E0A526',
        // No highlightBlock() call for the hat itself; the blocks under it still get one.
        suppressPrefixSuffix: true,
        tooltip: 'Blocks attached below run when you press Run',
        helpUrl: '',
    },
]);
