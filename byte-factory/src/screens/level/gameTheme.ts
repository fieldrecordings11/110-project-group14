import * as Blockly from 'blockly';

/** Dark Blockly theme shared by the level workspace and the lesson demos. */
export const gameTheme = Blockly.Theme.defineTheme('gameTheme', {
  name: 'gameTheme',
  base: Blockly.Themes.Classic,
  fontStyle: {
    family: 'monospace',
    size: 12,
    weight: 'bold',
  },
  componentStyles: {
    workspaceBackgroundColour: '#07100c',
    toolboxBackgroundColour: '#0e1711',
    toolboxForegroundColour: '#e5eee4',
    flyoutBackgroundColour: '#17231b',
    flyoutForegroundColour: '#e5eee4',
    flyoutOpacity: 1,
    scrollbarColour: '#56616e',
  },
});
