import * as Types from '@src/llm/types';
import { TAiConfig } from '@src/config/types';

/** Provider configuration factory */
export interface IFactory {
    /**
     * Creates a provider instance
     * @param name - Provider name
     * @returns Provider instance
     */
    createProvider(name: Types.TProvider): IBase;

    /**
     * Gets default config for provider
     * @param name - Provider name
     * @returns Default configuration
     */
    getDefaultConfig(name: Types.TProvider): Partial<TAiConfig>;
}

/** Base interface for all LLM providers */
export interface IBase {
    readonly name: Types.TProvider;
    readonly defaultConfig: Partial<TAiConfig>;

    /**
     * Transforms request to provider-specific format
     * @param request - Standard LLM request
     * @returns Provider-specific request body
     */
    transformRequest(
        request: Types.Broker.ILLMRequest,
    ): Record<string, unknown>;

    /**
     * Transforms provider response to standard format
     * @param responseData - Raw provider response
     * @returns Standardized LLM response
     */
    transformResponse(responseData: unknown): Types.Broker.TLLMResponse;

    /**
     * Builds authentication headers
     * @param apiKey - API key if required
     * @returns Headers object
     */
    buildAuthHeaders(apiKey?: string): Record<string, string>;

    /**
     * Validates configuration for this provider
     * @param config - Configuration to validate
     * @returns True if valid, throws error if invalid
     */
    validateConfig(config: TAiConfig): boolean;
}
