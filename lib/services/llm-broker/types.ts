import * as CONSTS from './consts';
import * as Provider from './providers/types';

export { Provider };

/**
 * Type definitions for the LLM service broker
 * Supports any LLM API endpoint with flexible authentication and configuration
 */

type TRole = typeof CONSTS.ROLE[keyof typeof CONSTS.ROLE];

/** Supported authentication methods for LLM APIs */
export type TAuthMethod = typeof CONSTS.AUTH_METHOD[keyof typeof CONSTS.AUTH_METHOD];

/** LLM provider configuration interface */
export interface ILLMConfig {
    /** Base URL for the LLM API endpoint */
    readonly baseURL: string;
    /** Model identifier/name to use */
    readonly model: string;
    /** Authentication method */
    readonly authMethod: TAuthMethod;
    /** API key (if using api-key or bearer auth) */
    readonly apiKey?: string;
    /** Custom headers for the request */
    readonly headers?: Record<string, string>;
    /** Request timeout in milliseconds (defaults to 30000) */
    readonly timeout?: number;
    /** Maximum retries for failed requests (defaults to 3) */
    readonly maxRetries?: number;
    /** Custom request body structure (for non-standard APIs) */
    readonly customRequestFormat?: boolean;
}

/** Standard LLM message structure */
export interface ILLMMessage {
    readonly role: TRole;
    readonly content: string;
}

/** LLM request payload structure */
export interface ILLMRequest {
    readonly model: string;
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
export interface ILLMServiceOptions {
    readonly config: ILLMConfig;
    readonly defaultTemperature?: number;
    readonly defaultMaxTokens?: number;
}

/** Error types that can occur during LLM operations */
export interface ILLMError {
    readonly type: 'network' | 'auth' | 'rate-limit' | 'invalid-request' | 'server' | 'unknown';
    readonly message: string;
    readonly statusCode?: number;
    readonly retryable: boolean;
    readonly originalError?: unknown;
}