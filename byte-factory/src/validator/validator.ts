import { ValidationResult, Level, BlockInfo } from "./types";

export class Validator {
    validate(blocks: BlockInfo[], level: Level): ValidationResult {
        throw new Error("Validator.validate not implemented yet")
    }
}