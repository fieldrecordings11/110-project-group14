import { Program, ProgramNode } from "./types"

export class Compiler {

    /**
     * Converts action blocks to program nodes
     * 
     * @param workspaceJson json representation of block stack built by player. 
     *  (includes blocks under run block and stray blocks)
     * @returns Program node to be interpereted and executed (will be constructed considering only blocks under run)
     */
    buildProgram(workspaceJson: any): Program {
        return [];
    }

    /**
     * Helper function to convert a stack of blocks into interpereter readable ProgamNodes
     * 
     * @param block one json object consisting of a stack of blocks
     * @returns 
     */
    private convertStack(block: any): ProgramNode[] {
        return [];
    }

    /**
     * Helper function to convert a singular block into a singular readable ProgramNode
     * 
     * @param block one json object consisting of a singular block
     */
    private convertBlock(block: any): ProgramNode {
        throw new Error("not implemented");
    }
}