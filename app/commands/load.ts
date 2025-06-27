import process from 'process';
import { EnvManager } from '@app/setup/env';
import * as Config from '@src/config';

export class ConfigCli extends Config.Config {
    public async mergeWithEnv(): Promise<Config.Types.IConfig> {
        const config = await this.load();
        if (!config) {
            this.log.error(`Error loading ${Config.CONSTS.CONFIG_FILE}`);
            process.exit(1);
        }
        const envManager = new EnvManager();
        const apiKey = await envManager.getApiKey();

        if (apiKey && 'provider' in config.ai) {
            return { ...config, ai: { ...config.ai, apiKey } };
        }
        return config;
    }
}
