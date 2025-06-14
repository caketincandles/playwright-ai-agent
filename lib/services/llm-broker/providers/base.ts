import * as Types from '../types';
import * as Logger from '../../logger'

/**
 * Abstract base class for LLM providers
 * Provides common functionality and enforces interface compliance
 */
export abstract class BaseProvider implements Types.Provider.IBase {
    abstract readonly name: Types.Provider.TName;
    abstract readonly defaultConfig: Partial<Types.ILLMConfig>;

    protected readonly logger = Logger.Log.LLM();

    /**
     * Transforms request to provider-specific format
     * @param request - Standard LLM request
     * @returns Provider-specific request body
     */
    abstract transformRequest(request: Types.ILLMRequest): Record<string, unknown>;

    /**
     * Transforms provider response to standard format
     * @param responseData - Raw provider response
     * @returns Standardized LLM response
     */
    abstract transformResponse(responseData: unknown): Types.TLLMResponse;

    /**
     * Builds authentication headers
     * @param apiKey - API key if required
     * @returns Headers object
     */
    abstract buildAuthHeaders(apiKey?: string): Record<string, string>;

    /**
     * Validates configuration for this provider
     * @param config - Configuration to validate
     * @returns True if valid, throws error if invalid
     */
    validateConfig(config: Types.ILLMConfig): boolean {
        if (!config.baseURL) this.logger.error(`${this.name}: baseURL is required`);
        if (!config.model) this.logger.error(`${this.name}: model is required`);
        return true;
    }

    /**
     * Extracts content from standardized response
     * @param response - LLM response
     * @returns Text content
     */
    protected extractContent(response: Types.TLLMResponse): string {
        if ('choices' in response) return response.choices[0]?.message.content ?? '';
        return response.content;
    }

    /**
     * Creates standard headers with content type
     * @returns Base headers
     */
    protected getBaseHeaders(): Record<string, string> {
        return {
            'Content-Type': 'application/json',
        };
    }
}
