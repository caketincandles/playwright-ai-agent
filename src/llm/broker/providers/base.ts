import * as Types from '../../types';
import * as Logger from '../../../../lib/services/logger';

/**
 * Abstract base class for LLM providers
 * Provides common functionality and enforces interface compliance
 */
export abstract class BaseProvider implements Types.Broker.Provider.IBase {
    abstract readonly name: Types.TName;
    abstract readonly defaultConfig: Partial<Types.Broker.ILLMConfig>;

    protected readonly logger: Logger.Types.ILogger = Logger.Log[Logger.CONSTS.SERVICE.DEV]();

    /**
     * Transforms request to provider-specific format
     * @param request - Standard LLM request
     * @returns Provider-specific request body
     */
    abstract transformRequest(
        request: Types.Broker.ILLMRequest,
    ): Record<string, unknown>;

    /**
     * Transforms provider response to standard format
     * @param responseData - Raw provider response
     * @returns Standardized LLM response
     */
    abstract transformResponse(responseData: unknown): Types.Broker.TLLMResponse;

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
    validateConfig(config: Types.Broker.ILLMConfig): boolean {
        if (!config.baseURL)
            this.logger.error(`${this.name}: baseURL is required`);
        if (!config.model) this.logger.error(`${this.name}: model is required`);
        return true;
    }

    /**
     * Extracts content from standardized response
     * @param response - LLM response
     * @returns Text content
     */
    protected extractContent(response: Types.Broker.TLLMResponse): string {
        if ('choices' in response)
            return response.choices[0]?.message.content ?? '';
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
