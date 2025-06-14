import axios, { type AxiosInstance, type AxiosRequestConfig } from 'axios';
import * as CONSTS from './consts';
import * as Types from '../types';
import { ProviderFactory } from './providers';

/**
 * LLM Service broker for communicating with any LLM API endpoint
 * Uses strongly typed providers with dedicated logic in subdirectories
 */
export class LLM {
    private readonly httpClient: AxiosInstance;
    private readonly config: Types.Broker.ILLMConfig;
    private readonly options: Types.Broker.ILLMServiceOptions;
    private readonly provider: Types.Broker.Provider.IBase;
    private readonly providerFactory: ProviderFactory;

    /**
     * Creates a new LLM service instance
     * @param serviceOptions - Configuration options for the LLM service
     */
    constructor(serviceOptions: Types.Broker.ILLMServiceOptions) {
        this.config = {
            ...CONSTS.DEFAULT_LLM_CONFIG,
            ...serviceOptions.config,
        };
        this.options = { ...CONSTS.DEFAULT_SERVICE_OPTIONS, ...serviceOptions };
        this.providerFactory = new ProviderFactory();

        // Auto-detect provider or use specified one
        const providerName = this.detectProvider();
        this.provider = this.providerFactory.createProvider(providerName);
        this.provider.validateConfig(this.config);

        this.httpClient = axios.create({
            baseURL: this.config.baseURL,
            timeout: this.config.timeout,
            headers: this.provider.buildAuthHeaders(this.config.apiKey),
        });

        this.setupInterceptors();
    }

    /**
     * Sends a chat completion request to the configured LLM endpoint
     * @param messages - Array of conversation messages
     * @param requestOptions - Optional request configuration overrides
     * @returns Promise resolving to the LLM response
     */
    async chatCompletion(
        messages: readonly Types.Broker.ILLMMessage[],
        requestOptions?: {
            readonly temperature?: number;
            readonly maxTokens?: number;
            readonly additionalParams?: Record<string, unknown>;
        },
    ): Promise<Types.Broker.TLLMResponse> {
        const request: Types.Broker.ILLMRequest = {
            model: this.config.model,
            messages,
            temperature:
                requestOptions?.temperature ?? this.options.defaultTemperature,
            maxTokens:
                requestOptions?.maxTokens ?? this.options.defaultMaxTokens,
            stream: false,
            additionalParams: requestOptions?.additionalParams,
        };

        const requestBody = this.provider.transformRequest(request);

        try {
            const response = await this.httpClient.request({
                method: 'POST',
                url: '',
                data: requestBody,
            });

            return this.provider.transformResponse(response.data);
        } catch (error) {
            const err = this.handleError(error);
            const wrappedError = new Error(err.message);
            Object.assign(wrappedError, { err });

            throw wrappedError;
        }
    }

    /**
     * Sends a simple text completion request
     * @param prompt - Text prompt to send
     * @param systemMessage - Optional system message for context
     * @param requestOptions - Optional request configuration overrides
     * @returns Promise resolving to the response content
     */
    async textCompletion(
        prompt: string,
        systemMessage?: string,
        requestOptions?: {
            readonly temperature?: number;
            readonly maxTokens?: number;
        },
    ): Promise<string> {
        const messages: Types.Broker.ILLMMessage[] = [];

        if (systemMessage)
            messages.push({ role: 'system', content: systemMessage });
        messages.push({ role: 'user', content: prompt });

        const response = await this.chatCompletion(messages, requestOptions);
        return this.extractContent(response);
    }

    /**
     * Tests the connection to the LLM endpoint
     * @returns Promise resolving to true if connection successful
     */
    async testConnection(): Promise<boolean> {
        try {
            await this.textCompletion('Test', undefined, { maxTokens: 1 });
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Creates an LLM service from a provider preset
     * @param provider - Strongly typed provider name
     * @param apiKey - API key for authentication (if required)
     * @param model - Model name to use
     * @param overrides - Additional configuration overrides
     * @returns Configured LLM service instance
     */
    static fromPreset(
        provider: Types.TName,
        apiKey: string | undefined,
        model: string,
        overrides?: Partial<Types.Broker.ILLMConfig>,
    ): LLM {
        const factory = new ProviderFactory();
        const defaultConfig = factory.getDefaultConfig(provider);
        const config: Types.Broker.ILLMConfig = {
            ...defaultConfig,
            apiKey,
            model,
            ...overrides,
        } as Types.Broker.ILLMConfig;

        return new LLM({ config });
    }

    /**
     * Auto-detects provider based on configuration
     * @returns Detected provider name
     */
    private detectProvider(): Types.TName {
        if (this.config.baseURL.includes('api.openai.com')) {
            return 'openai';
        }
        if (this.config.baseURL.includes('api.anthropic.com')) {
            return 'anthropic';
        }
        return 'local';
    }

    /** Sets up axios interceptors for retry logic and error handling */
    private setupInterceptors(): void {
        this.httpClient.interceptors.response.use(
            (response) => response,
            async (error: unknown) => {
                if (axios.isAxiosError(error) && error.config) {
                    const config = error.config as AxiosRequestConfig & {
                        _retryCount?: number;
                    };
                    const retryCount = config._retryCount ?? 0;

                    if (
                        this.shouldRetry(error) &&
                        retryCount < (this.config.maxRetries ?? 3)
                    ) {
                        config._retryCount = retryCount + 1;
                        const delay =
                            CONSTS.RETRY_DELAYS[retryCount] ??
                            CONSTS.RETRY_DELAYS[CONSTS.RETRY_DELAYS.length - 1];
                        await this.delay(delay);
                        return this.httpClient.request(config);
                    }
                }

                return Promise.reject(
                    error instanceof Error
                        ? error
                        : new Error('Unexpected error'),
                );
            },
        );
    }

    /**
     * Determines if an error should trigger a retry
     * @param error - The error to evaluate
     * @returns True if the error is retryable
     */
    private shouldRetry(error: unknown): boolean {
        if (axios.isAxiosError(error)) {
            const status = error.response?.status;
            return (
                status !== undefined &&
                CONSTS.RETRYABLE_STATUS_CODES.includes(status as never)
            );
        }
        return false;
    }

    /**
     * Extracts text content from any response type
     * @param response - LLM response object
     * @returns Text content from the response
     */
    private extractContent(response: Types.Broker.TLLMResponse): string {
        if ('choices' in response) {
            return response.choices[0]?.message.content ?? '';
        }
        return response.content;
    }

    /**
     * Handles and transforms errors into standardised format
     * @param error - The original error
     * @returns Standardised LLM error
     */
    private handleError(error: unknown): Types.Broker.ILLMError {
        if (axios.isAxiosError(error)) {
            const status = error.response?.status ?? 0;
            const errorType = CONSTS.ERROR_TYPE_MAP[status] ?? 'unknown';

            return {
                type: errorType,
                message: error.message,
                statusCode: status,
                retryable: CONSTS.RETRYABLE_STATUS_CODES.includes(
                    status as never,
                ),
                originalError: error,
            };
        }

        return {
            type: 'unknown',
            message:
                error instanceof Error
                    ? error.message
                    : 'Unknown error occurred',
            retryable: false,
            originalError: error,
        };
    }

    /**
     * Creates a delay for retry backoff
     * @param ms - Milliseconds to delay
     * @returns Promise that resolves after the delay
     */
    private async delay(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
}
