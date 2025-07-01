import * as LlmTypes from '@src/llm/types';
import { AUTH_METHOD } from '@src/config/consts';

export type TAuthMethod =
    (typeof AUTH_METHOD)[keyof typeof AUTH_METHOD];

interface IBaseAiConfig {
    readonly apiUrl: string;
    readonly provider: LlmTypes.TProvider;
    readonly authMethod?: TAuthMethod;
    readonly apiKey?: string;
    readonly customRequestFormat?: boolean;
    readonly headers?: Record<string, string>;
    readonly maxRetries?: number;
    readonly model?: LlmTypes.TModelValue;
    readonly timeout?: number;
}

export interface IExternalAiConfig extends IBaseAiConfig {
    readonly apiKey: string;
    readonly model: LlmTypes.TModelValue;
}

export interface IAiInternalConfig extends IBaseAiConfig {
    readonly authMethod: TAuthMethod;
    readonly model?: never;
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
