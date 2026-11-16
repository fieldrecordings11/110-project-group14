import { describe, it, expect } from 'vitest';
import { toolbox } from '../toolbox';
import { buildToolbox } from '../levels/toolbox';

function blockTypes(tb: typeof toolbox): string[] {
    const types: string[] = [];
    for (const category of tb.contents) {
        for (const block of category.contents) {
            types.push(block.type);
        }
    }
    return types;
}

function categoryNames(tb: typeof toolbox): string[] {
    return tb.contents.map((category) => category.name);
}

describe('buildToolbox', () => {
    it('keeps only the allowed blocks', () => {
        const result = buildToolbox(['move_up', 'move_right', 'controls_if']);

        expect(blockTypes(result)).toEqual(['move_right', 'move_up', 'controls_if']);
    });

    it('leaves out categories with no allowed blocks', () => {
        const result = buildToolbox(['move_up', 'controls_repeat_ext']);

        expect(categoryNames(result)).toEqual(['Movement', 'Loops']);
    });

    it('keeps the default inputs of a block', () => {
        const result = buildToolbox(['controls_repeat_ext']);
        const repeat = result.contents[0].contents[0];

        expect(repeat).toEqual(toolbox.contents.find((c) => c.name === 'Loops')?.contents[0]);
    });

    it('returns the full toolbox when every block is allowed', () => {
        expect(buildToolbox(blockTypes(toolbox))).toEqual(toolbox);
    });

    it('returns no categories when no blocks are allowed', () => {
        expect(buildToolbox([]).contents).toEqual([]);
    });

    it('ignores block types that are not in the toolbox', () => {
        expect(blockTypes(buildToolbox(['move_up', 'not_a_block']))).toEqual(['move_up']);
    });

    it('does not modify the full toolbox', () => {
        const before = structuredClone(toolbox);

        buildToolbox(['move_up']);

        expect(toolbox).toEqual(before);
    });
});
