import * as CONSTS from '../../consts';
import { ILLMConfig, ILLMRequest, TLLMResponse } from '../types';

export type TName = (typeof CONSTS.PROVIDERS)[keyof typeof CONSTS.PROVIDERS];

/** Provider configuration factory */
export interface IFactory {
    /**
     * Creates a provider instance
     * @param name - Provider name
     * @returns Provider instance
     */
    createProvider(name: TName): IBase;

    /**
     * Gets default config for provider
     * @param name - Provider name
     * @returns Default configuration
     */
    getDefaultConfig(name: TName): Partial<ILLMConfig>;
}

/** Base interface for all LLM providers */
export interface IBase {
    readonly name: TName;
    readonly defaultConfig: Partial<ILLMConfig>;

    /**
     * Transforms request to provider-specific format
     * @param request - Standard LLM request
     * @returns Provider-specific request body
     */
    transformRequest(request: ILLMRequest): Record<string, unknown>;

    /**
     * Transforms provider response to standard format
     * @param responseData - Raw provider response
     * @returns Standardized LLM response
     */
    transformResponse(responseData: unknown): TLLMResponse;

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
    validateConfig(config: ILLMConfig): boolean;
}
