// to be used by compiler and passed to interpereter
export type ProgramNode = {
  id: string;
  type: string;
  count?: number;          // repeat
  body?: ProgramNode[];    // repeat
  condition?: string;      // if
  then?: ProgramNode[];    // if
  else?: ProgramNode[];    // if
};
export type Program = ProgramNode[];