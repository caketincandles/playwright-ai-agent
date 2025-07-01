import { ACTION } from '@src/llm/prompts/consts';
import { TTargetType } from '@src/services/types';

export type TAction = (typeof ACTION)[keyof typeof ACTION];

export interface ISuffixes {
    readonly target: TTargetType;
    classSuffixes?: readonly string[];
    paramSuffixes?: readonly string[];
}

export interface ITargetFiles {
    fileName: string;
    content: string;
}

export interface IXmlSchema {
    readonly identity: string;
    main_objective: string;
    instructions: string[];
    rules: string[];
    code: ITargetFiles[];
    inclusions?: ISuffixes[];
}
