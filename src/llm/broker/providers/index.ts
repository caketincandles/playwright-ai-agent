import * as Types from '@src/llm/types';
import * as CONSTS from '@src/llm/consts';
import { devLog } from '@lib/services/logger';
import { OpenAI } from '@src/llm/broker/providers/open-ai';
import { Anthropic } from '@src/llm/broker/providers/anthropic';
import { Local } from '@src/llm/broker/providers/local';
import { TAiConfig } from '@src/config/types';

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

    /**
     * Creates a provider instance
     * @param name - Provider name
     * @returns Provider instance
     */
    public createProvider(name: Types.TProvider): Types.Broker.Provider.IBase {
        const provider = this.providers.get(name);
        if (!provider) {
            devLog.error(`Unknown provider: ${name}`, {
                availableProviders: this.getAvailableProviders(),
            });
        }

        devLog.debug(`Created provider: ${name}`);
        // logger handles exits more cleanly but then run into null issues rip
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        return provider!;
    }

    /**
     * Gets default config for provider
     * @param name - Provider name
     * @returns Default configuration
     */
    public getDefaultConfig(
        name: Types.TProvider,
    ): Partial<TAiConfig> {
        const provider = this.createProvider(name);
        return provider.defaultConfig;
    }

    /**
     * Gets all available provider names
     * @returns Array of provider names
     */
    public getAvailableProviders(): readonly Types.TProvider[] {
        return Array.from(this.providers.keys());
    }

    /**
     * Creates provider from preset configuration
     * @param name - Provider name
     * @param config - Configuration overrides
     * @returns Configured provider
     */
    public createFromPreset(
        name: Types.TProvider,
        config: Partial<TAiConfig> = {},
    ): Types.Broker.Provider.IBase {
        const provider = this.createProvider(name);
        const mergedConfig = {
            ...provider.defaultConfig,
            ...config,
        } as TAiConfig;
        provider.validateConfig(mergedConfig);
        return provider;
    }
}
