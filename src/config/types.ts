import * as LlmTypes from '@src/llm/types';
import * as CONSTS from '@src/config/consts';

export type TAuthMethod =
    (typeof CONSTS.AUTH_METHOD)[keyof typeof CONSTS.AUTH_METHOD];

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

export interface IProjectPageConfig {
    readonly directory: string;
    readonly classSuffixes?: readonly string[];
}

export interface IProjectLocatorConfig extends IProjectPageConfig {
    readonly paramSuffixes?: readonly string[];
}

export interface IConfig {
    readonly ai: TAiConfig;
    readonly locators: IProjectLocatorConfig;
    readonly pages: IProjectPageConfig;
}

/** Primary service type */
export type TServiceType = (typeof CONSTS.SERVICE)[keyof typeof CONSTS.SERVICE];

/** Target type for operations */
export type TTargetType = (typeof CONSTS.TARGET)[keyof typeof CONSTS.TARGET];
