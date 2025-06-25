import * as Types from '../../types';
import * as CONSTS from '../../consts';
import * as Logger from '../../../../lib/services/logger';
import { OpenAI } from './open-ai';
import { Anthropic } from './anthropic';
import { Local } from './local';

export { OpenAI, Anthropic, Local };

/** Factory for creating LLM provider instances - centralises instantiation and config */
export class ProviderFactory implements Types.Broker.Provider.IFactory {
    private readonly providers = new Map<
        Types.TProvider,
        Types.Broker.Provider.IBase
    >([
        [CONSTS.PROVIDERS.OPEN_AI, new OpenAI()],
        [CONSTS.PROVIDERS.ANTHROPIC, new Anthropic()],
        [CONSTS.PROVIDERS.LOCAL, new Local()],
    ]);

    private readonly logger = Logger.Log['Developer-Log']();

    /**
     * Creates a provider instance
     * @param name - Provider name
     * @returns Provider instance
     */
    createProvider(name: Types.TProvider): Types.Broker.Provider.IBase {
        const provider = this.providers.get(name);
        if (!provider) {
            this.logger.error(`Unknown provider: ${name}`, {
                availableProviders: this.getAvailableProviders(),
            });
        }

        this.logger.debug(`Created provider: ${name}`);
        // logger handles exits more cleanly but then run into null issues rip
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        return provider!;
    }

    /**
     * Gets default config for provider
     * @param name - Provider name
     * @returns Default configuration
     */
    getDefaultConfig(name: Types.TProvider): Partial<Types.Broker.ILLMConfig> {
        const provider = this.createProvider(name);
        return provider.defaultConfig;
    }

    /**
     * Gets all available provider names
     * @returns Array of provider names
     */
    getAvailableProviders(): readonly Types.TProvider[] {
        return Array.from(this.providers.keys());
    }

    /**
     * Creates provider from preset configuration
     * @param name - Provider name
     * @param config - Configuration overrides
     * @returns Configured provider
     */
    createFromPreset(
        name: Types.TProvider,
        config: Partial<Types.Broker.ILLMConfig> = {},
    ): Types.Broker.Provider.IBase {
        const provider = this.createProvider(name);
        const mergedConfig = {
            ...provider.defaultConfig,
            ...config,
        } as Types.Broker.ILLMConfig;
        provider.validateConfig(mergedConfig);
        return provider;
    }
}
