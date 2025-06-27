import * as Types from '@src/llm/broker/types';
import * as CONSTS from '@src/llm/consts';
import { BaseProvider } from '@src/llm/broker/providers/base';
import { devLog } from '@lib/services/logger';

/**
 * OpenAI provider implementation
 * Handles OpenAI API-compatible requests and responses
 */
export class OpenAI extends BaseProvider {
    public readonly name = CONSTS.PROVIDERS.OPEN_AI;
    public readonly defaultConfig: Partial<Types.ILLMConfig> = {
        baseURL: 'https://api.openai.com/v1/chat/completions',
        authMethod: 'bearer',
        customRequestFormat: false,
    };

    public transformRequest(
        request: Types.ILLMRequest,
    ): Record<string, unknown> {
        return {
            model: request.model,
            messages: request.messages,
            temperature: request.temperature,
            max_tokens: request.maxTokens,
            stream: request.stream,
            ...request.additionalParams,
        };
    }

    public transformResponse(responseData: unknown): Types.TLLMResponse {
        return responseData as Types.ILLMResponse;
    }

    public buildAuthHeaders(apiKey?: string): Record<string, string> {
        return {
            ...this.getBaseHeaders(),
            Authorization: `Bearer ${apiKey ?? ''}`,
        };
    }

    public validateConfig(config: Types.ILLMConfig): boolean {
        super.validateConfig(config);
        if (config.authMethod !== 'none' && !config.apiKey) {
            devLog.error('OpenAI: apiKey is required');
        }
        return true;
    }
}
