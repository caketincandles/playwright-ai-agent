import * as Types from '@src/llm/broker/types';
import * as CONSTS from '@src/llm/consts';
import { BaseProvider } from '@src/llm/broker/providers/base';
import { IAiInternalConfig } from '@src/config/types';

/**
 * Local LLM provider implementation
 * Handles local/self-hosted LLM APIs with no authentication
 */
export class Local extends BaseProvider {
    public readonly name = CONSTS.PROVIDERS.LOCAL;
    public readonly defaultConfig: Partial<IAiInternalConfig> = {
        apiUrl: 'http://localhost:8080/v1/chat/completions',
        authMethod: 'none',
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

    public buildAuthHeaders(): Record<string, string> {
        return this.getBaseHeaders();
    }

    public validateConfig(config: IAiInternalConfig): boolean {
        super.validateConfig(config);
        return true;
    }
}
