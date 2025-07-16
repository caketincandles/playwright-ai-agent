import * as LlmTypes from '@src/llm/types';
import * as CONSTS from '@src/config/consts';
import { ISettingsSetupConfig, ISetupConfig } from '@app/types';
import { TKeysOfType } from '@lib/util/data-types/types';

export type TAuthMethod =
    (typeof CONSTS.AUTH_METHOD)[keyof typeof CONSTS.AUTH_METHOD];

export interface IProjectSummary {
    base?: Record<TTargetType, string>;
    examples?: Record<TTargetType, string>;
}

export interface IBaseAiConfig {
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

export interface IPromptConfigFile {
    readonly filePaths: string[];
    prompt?: string;
}

export interface ISettingsConfigFile extends ISettingsSetupConfig {
    base?: IPromptConfigFile;
    example?: IPromptConfigFile;
}

export type TPromptConfigKeys = TKeysOfType<
    ISettingsConfigFile,
    IPromptConfigFile
>;

export interface IConfigFile extends ISetupConfig {
    readonly settings: ISettingsConfigFile;
    project?: IProjectSummary;
}

/** Primary service type */
export type TServiceType = (typeof CONSTS.SERVICE)[keyof typeof CONSTS.SERVICE];

/** Target type for operations */
export type TTargetType = (typeof CONSTS.TARGET)[keyof typeof CONSTS.TARGET];
