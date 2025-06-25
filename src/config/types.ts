import * as LlmTypes from '@src/llm/types';

interface IBaseAiConfig {
    readonly provider: LlmTypes.TProvider;
    readonly model?: LlmTypes.TModelValue;
    readonly apiKey?: string;
    readonly apiUrl?: string;
}

export interface IExternalAiConfig extends IBaseAiConfig {
    readonly model: LlmTypes.TModelValue;
    readonly apiKey: string;
}

export interface IAiInternalConfig extends IBaseAiConfig {
    readonly model?: never;
    readonly apiUrl: string;
}

export type TAiConfig = IExternalAiConfig | IAiInternalConfig;

export interface IBaseProjectConfig {
    readonly directory: string;
    readonly classSuffixes?: readonly string[];
}

export interface IProjectConfig extends IBaseProjectConfig {
    readonly paramSuffixes?: readonly string[];
}

export interface IConfig {
    readonly ai: TAiConfig;
    readonly locators: IProjectConfig;
    readonly pages: IBaseProjectConfig;
}
