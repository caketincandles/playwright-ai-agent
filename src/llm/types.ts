import * as CONSTS from './consts';
import * as Broker from './broker/types';

export { Broker };

export type TRole = (typeof CONSTS.ROLE)[keyof typeof CONSTS.ROLE];
export type TProvider = (typeof CONSTS.PROVIDERS)[keyof typeof CONSTS.PROVIDERS];
export type TProviderModels = typeof CONSTS.PROVIDER_MODELS;
export type TOpenAiModels = typeof CONSTS.PROVIDER_MODELS[typeof CONSTS.PROVIDERS.OPEN_AI];
export type TAnthropicModels = typeof CONSTS.PROVIDER_MODELS[typeof CONSTS.PROVIDERS.ANTHROPIC];
export type TModelValue = TOpenAiModels | TAnthropicModels;
export type TService = typeof CONSTS.SERVICE[keyof typeof CONSTS.SERVICE];