import { ValidationResult } from "./types";
import { Level } from "../levels/types"
import * as Blockly from "blockly/core"

export class Validator {

    /**
     * 
     * @param workspace
     * Blockly workspace to extract used blocks
     * @param level 
     * Description of level with id, allowedBlocks, and blockLimit
     * @returns ValidationResult; can be true if all blocks to be ran are ok, false otherwise
     */
    validate(workspace: Blockly.Workspace, level: Level): ValidationResult {
        const blocks = workspace.getAllBlocks(false)
            .filter((b) => b.type !== "start");

        // empty program check
        if (blocks.length == 0) {
            return { ok: false, reason: "empty_program", message: "Add some blocks before pressing Run!"}
        }

        // allowed blocks for level check
        for (const block of blocks) {
            if (!level.allowedBlocks.includes(block.type)) {
                return { ok: false, reason: "block_not_allowed", blockId: block.id, 
                    message: "You can't use that block in this level yet." };
            }
        }

        // block limit for level check
        if (blocks.length > level.blockLimit) {
            return { ok: false, reason: "too_many_blocks", 
                message: `This level allows at most ${level.blockLimit} blocks.` }
        }

        return { ok: true }
    }
}