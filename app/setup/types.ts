import * as LlmTypes from '@src/llm/types';

interface IAiSetupResponse {
    readonly provider: LlmTypes.TProvider;
    readonly model?: LlmTypes.TModelValue;
    readonly apiKey?: string;
    readonly apiUrl?: string;
}

export interface IExternalAiSetupResponse extends IAiSetupResponse {
    readonly model: LlmTypes.TModelValue;
    readonly apiKey: string;
}

export interface IAiInternalSetupResponse extends IAiSetupResponse {
    readonly model?: never;
    readonly apiUrl: string;
}

export type TAiSetupResponse = IExternalAiSetupResponse | IAiInternalSetupResponse;

export interface IBaseProjectSetup {
    readonly directory: string;
    readonly classSuffixes?: readonly string[];
}

export interface IProjectSetup extends IBaseProjectSetup {
    readonly paramSuffixes?: readonly string[];
}

export interface ISetupResponses {
    readonly ai: TAiSetupResponse;
    readonly locators: IProjectSetup;
    readonly pages: IBaseProjectSetup;
}
