import * as Types from '../types';
import * as CONSTS from '../../consts';
import { BaseProvider } from './base';

/**
 * Anthropic Claude provider implementation
 * Handles Anthropic API requests and responses with custom formatting
 */
export class Anthropic extends BaseProvider {
    readonly name = CONSTS.PROVIDERS.ANTHROPIC;
    readonly defaultConfig: Partial<Types.ILLMConfig> = {
        baseURL: 'https://api.anthropic.com/v1/messages',
        authMethod: 'api-key',
        customRequestFormat: true,
        headers: {
            'anthropic-version': '2023-06-01',
        },
    };

    transformRequest(request: Types.ILLMRequest): Record<string, unknown> {
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

    transformResponse(responseData: unknown): Types.TLLMResponse {
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

    buildAuthHeaders(apiKey?: string): Record<string, string> {
        return {
            ...this.getBaseHeaders(),
            'x-api-key': apiKey ?? '',
            'anthropic-version': '2023-06-01',
        };
    }

    validateConfig(config: Types.ILLMConfig): boolean {
        super.validateConfig(config);
        if (!config.apiKey) this.logger.error('Anthropic: apiKey is required');
        return true;
    }
}
