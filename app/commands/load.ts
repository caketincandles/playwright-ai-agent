import { IConfig } from '@src/config/types';
import { ILogger } from '@lib/services/logger/types';
import { EnvManager } from '@app/setup/env';
import { CONFIG_FILE } from '@src/config/consts';
import Config from '@src/config';

export class ConfigCli extends Config {
    constructor(
        private readonly log: ILogger
    ) {
        super();
    }

    public async mergeWithEnv(): Promise<IConfig> {
        const config = await this.load();
        if(!config) {
            this.log.error(`Error loading ${CONFIG_FILE}`);
        }
        const envManager = new EnvManager();
        const apiKey = await envManager.getApiKey();
    
        if (apiKey && 'provider' in config.ai) {
            return { ...config, ai: { ...config.ai, apiKey } };
        }
        return config;
    }
}
