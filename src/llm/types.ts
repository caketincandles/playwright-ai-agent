import * as CONSTS from '@src/llm/consts';
import * as Broker from '@src/llm/broker/types';

export { Broker };

type TParseType<T> = T extends 'string'
    ? string
    : T extends 'string[]'
      ? string[]
      : T extends '{ snippet: string, reason: string }[]'
        ? { snippet: string; reason: string }[]
        : never;

export type TRole = (typeof CONSTS.ROLE)[keyof typeof CONSTS.ROLE];
export type TProvider =
    (typeof CONSTS.PROVIDERS)[keyof typeof CONSTS.PROVIDERS];
export type TProviderModels = typeof CONSTS.PROVIDER_MODELS;
export type TOpenAiModels =
    (typeof CONSTS.PROVIDER_MODELS)[typeof CONSTS.PROVIDERS.OPEN_AI];
export type TAnthropicModels =
    (typeof CONSTS.PROVIDER_MODELS)[typeof CONSTS.PROVIDERS.ANTHROPIC];
export type TModelValue = TOpenAiModels | TAnthropicModels;

export type TResponseSchema = {
    [K in keyof typeof CONSTS.RESPONSE_SCHEMA]: (typeof CONSTS.RESPONSE_SCHEMA)[K]['optional'] extends true
        ? TParseType<(typeof CONSTS.RESPONSE_SCHEMA)[K]['type']> | undefined
        : TParseType<(typeof CONSTS.RESPONSE_SCHEMA)[K]['type']>;
};
