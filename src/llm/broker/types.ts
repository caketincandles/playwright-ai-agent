import * as Provider from '@src/llm/broker/providers/types';
import { TModelValue, TRole } from '@src/llm/types';
import { TAiConfig } from '@src/config/types';

export { Provider };

/** Standard LLM message structure */
export interface ILLMMessage {
    readonly role: TRole;
    readonly content: string;
}

/** LLM request payload structure */
export interface ILLMRequest {
    readonly model?: TModelValue;
    readonly messages: readonly ILLMMessage[];
    readonly temperature?: number;
    readonly maxTokens?: number;
    readonly stream?: boolean;
    /** Additional parameters for specific LLM providers */
    readonly additionalParams?: Record<string, unknown>;
}

/** LLM response choice structure */
export interface ILLMChoice {
    readonly index: number;
    readonly message: ILLMMessage;
    readonly finishReason?: string;
}

/** LLM response usage statistics */
export interface ILLMUsage {
    readonly promptTokens: number;
    readonly completionTokens: number;
    readonly totalTokens: number;
}

/** Standard LLM response structure */
export interface ILLMResponse {
    readonly id: string;
    readonly object: string;
    readonly created: number;
    readonly model: string;
    readonly choices: readonly ILLMChoice[];
    readonly usage?: ILLMUsage;
}

/** Custom LLM response for non-standard APIs */
export interface ICustomLLMResponse {
    readonly content: string;
    readonly metadata?: Record<string, unknown>;
}

/** Union type for all possible LLM responses */
export type TLLMResponse = ILLMResponse | ICustomLLMResponse;

/** LLM service configuration options */
export interface ILlmServiceOptions {
    readonly config: TAiConfig;
    readonly defaultTemperature?: number;
    readonly defaultMaxTokens?: number;
}

/** Error types that can occur during LLM operations */
export interface ILLMError {
    readonly type:
        | 'network'
        | 'auth'
        | 'rate-limit'
        | 'invalid-request'
        | 'server'
        | 'unknown';
    readonly message: string;
    readonly statusCode?: number;
    readonly retryable: boolean;
    readonly originalError?: unknown;
}
