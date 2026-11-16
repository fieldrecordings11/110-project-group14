import { toolbox } from '../toolbox';

type Toolbox = typeof toolbox;

/**
 * Builds a level's toolbox from the full toolbox, keeping only the allowed blocks.
 * Blocks keep their category and default inputs (e.g. the 10 in "repeat 10 times"),
 * and categories with no allowed blocks are left out.
 * @param allowedBlocks
 * Block types the level allows, i.e. level.allowedBlocks
 * @returns a new toolbox; the full toolbox is not modified
 */
export function buildToolbox(allowedBlocks: string[]): Toolbox {
    const contents = toolbox.contents
        .map((category) => ({
            ...category,
            contents: category.contents.filter((block) => allowedBlocks.includes(block.type)),
        }))
        .filter((category) => category.contents.length > 0);

    return { ...toolbox, contents };
}
