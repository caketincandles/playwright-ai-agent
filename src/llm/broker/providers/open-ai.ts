import * as Types from '../types';
import * as CONSTS from '../../consts';
import { BaseProvider } from './base';

/**
 * OpenAI provider implementation
 * Handles OpenAI API-compatible requests and responses
 */
export class OpenAI extends BaseProvider {
    readonly name = CONSTS.PROVIDERS.OPEN_AI;
    readonly defaultConfig: Partial<Types.ILLMConfig> = {
        baseURL: 'https://api.openai.com/v1/chat/completions',
        authMethod: 'bearer',
        customRequestFormat: false,
    };

    transformRequest(request: Types.ILLMRequest): Record<string, unknown> {
        return {
            model: request.model,
            messages: request.messages,
            temperature: request.temperature,
            max_tokens: request.maxTokens,
            stream: request.stream,
            ...request.additionalParams,
        };
    }

    transformResponse(responseData: unknown): Types.TLLMResponse {
        return responseData as Types.ILLMResponse;
    }

    buildAuthHeaders(apiKey?: string): Record<string, string> {
        return {
            ...this.getBaseHeaders(),
            Authorization: `Bearer ${apiKey ?? ''}`,
        };
    }

    validateConfig(config: Types.ILLMConfig): boolean {
        super.validateConfig(config);
        if (config.authMethod !== 'none' && !config.apiKey) {
            this.logger.error('OpenAI: apiKey is required');
        }
        return true;
    }
}
