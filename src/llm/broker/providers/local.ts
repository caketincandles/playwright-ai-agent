import * as Types from '../types';
import * as CONSTS from '../../consts';
import { BaseProvider } from './base';

/**
 * Local LLM provider implementation
 * Handles local/self-hosted LLM APIs with no authentication
 */
export class Local extends BaseProvider {
    readonly name = CONSTS.PROVIDERS.LOCAL;
    readonly defaultConfig: Partial<Types.ILLMConfig> = {
        baseURL: 'http://localhost:8080/v1/chat/completions',
        authMethod: 'none',
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

    buildAuthHeaders(): Record<string, string> {
        return this.getBaseHeaders();
    }

    validateConfig(config: Types.ILLMConfig): boolean {
        super.validateConfig(config);
        return true;
    }
}
