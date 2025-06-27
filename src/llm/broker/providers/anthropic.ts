import * as Types from '@src/llm/broker/types';
import * as CONSTS from '@src/llm/consts';
import { BaseProvider } from '@src/llm/broker/providers/base';
import { devLog } from '@lib/services/logger';

/**
 * Anthropic Claude provider implementation
 * Handles Anthropic API requests and responses with custom formatting
 */
export class Anthropic extends BaseProvider {
    public readonly name = CONSTS.PROVIDERS.ANTHROPIC;
    public readonly defaultConfig: Partial<Types.ILLMConfig> = {
        baseURL: 'https://api.anthropic.com/v1/messages',
        authMethod: 'api-key',
        customRequestFormat: true,
        headers: {
            'anthropic-version': '2023-06-01',
        },
    };

    public transformRequest(
        request: Types.ILLMRequest,
    ): Record<string, unknown> {
        const systemMessages = request.messages.filter(
            (m) => m.role === 'system',
        );
        const userMessages = request.messages.filter(
            (m) => m.role !== 'system',
        );

        return {
            model: request.model,
            max_tokens: request.maxTokens ?? 1000,
            system:
                systemMessages.map((m) => m.content).join('\n') || undefined,
            messages: userMessages.map((m) => ({
                role: m.role,
                content: m.content,
            })),
            temperature: request.temperature,
            ...request.additionalParams,
        };
    }

    public transformResponse(responseData: unknown): Types.TLLMResponse {
        const data = responseData as {
            content?: { text?: string }[];
            [key: string]: unknown;
        };
        const content = data.content?.[0]?.text ?? '';

        return {
            content,
            metadata: data,
        };
    }

    public buildAuthHeaders(apiKey?: string): Record<string, string> {
        return {
            ...this.getBaseHeaders(),
            'x-api-key': apiKey ?? '',
            'anthropic-version': '2023-06-01',
        };
    }

    public validateConfig(config: Types.ILLMConfig): boolean {
        super.validateConfig(config);
        if (!config.apiKey) devLog.error('Anthropic: apiKey is required');
        return true;
    }
}
