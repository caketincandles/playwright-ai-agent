import { TAuthMethod, TAiConfig } from '@src/config/types';
import * as Types from '@src/llm/broker/types';

/** Default configuration values for LLM service */
export const DEFAULT_LLM_CONFIG: Partial<TAiConfig> = {
    timeout: 30000,
    maxRetries: 3,
    authMethod: 'api-key',
    customRequestFormat: false,
} as const;

/** Default service options */
export const DEFAULT_SERVICE_OPTIONS: Partial<Types.ILlmServiceOptions> = {
    defaultTemperature: 0.6,
    defaultMaxTokens: 100000,
} as const;

/** Standard headers for different auth methods */
export const AUTH_HEADERS: Record<
    TAuthMethod,
    (apiKey?: string) => Record<string, string>
> = {
    'api-key': (apiKey?: string) => ({
        Authorization: `Bearer ${apiKey ?? ''}`,
        'Content-Type': 'application/json',
    }),
    bearer: (apiKey?: string) => ({
        Authorization: `Bearer ${apiKey ?? ''}`,
        'Content-Type': 'application/json',
    }),
    none: () => ({
        'Content-Type': 'application/json',
    }),
    custom: () => ({}),
} as const;

/** Common LLM provider endpoints and configurations */
export const PROVIDER_PRESETS: Record<string, Partial<TAiConfig>> = {
    openai: {
        apiUrl: 'https://api.openai.com/v1/chat/completions',
        authMethod: 'bearer',
        customRequestFormat: false,
    },
    anthropic: {
        apiUrl: 'https://api.anthropic.com/v1/messages',
        authMethod: 'api-key',
        customRequestFormat: true,
        headers: {
            'anthropic-version': '2023-06-01',
        },
    },
    local: {
        apiUrl: 'http://localhost:8080/v1/chat/completions',
        authMethod: 'none',
        customRequestFormat: false,
    },
} as const;

/** HTTP status codes that indicate errors but allow to retry */
export const RETRYABLE_STATUS_CODES = [
    408, // Request Timeout
    429, // Too Many Requests
    500, // Internal Server Error
    502, // Bad Gateway
    503, // Service Unavailable
    504, // Gateway Timeout
] as const;

/** Base retry delays in milliseconds (exponential) */
export const RETRY_DELAYS = [1000, 2000, 4000, 8000] as const;

/** Error type mapping based on HTTP status codes */
export const ERROR_TYPE_MAP: Record<number, Types.ILLMError['type']> = {
    400: 'invalid-request',
    401: 'auth',
    403: 'auth',
    429: 'rate-limit',
    500: 'server',
    502: 'server',
    503: 'server',
    504: 'server',
} as const;
