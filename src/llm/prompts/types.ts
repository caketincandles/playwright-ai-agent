import { ACTION, PLAYWRIGHT_FILE } from '@src/llm/prompts/consts';

export type TPlaywrightFile = typeof PLAYWRIGHT_FILE[keyof typeof PLAYWRIGHT_FILE];
export type TAction = typeof ACTION[keyof typeof ACTION];

export interface ISuffixes {
    classSuffixes?: readonly string[];
    paramSuffixes?: readonly string[];
}

export interface ITargetFiles {
    content: string[];
    inclusions?: ISuffixes;
}

export interface IXmlSchema {
    readonly identity: string;
    main_objective: string;
    instructions: string[];
    rules: string[];
    code: ITargetFiles;
}
