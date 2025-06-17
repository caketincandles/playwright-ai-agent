import { FileService } from '@lib/services/file';
import { ISetupResponses } from '@app/setup/types';
import { ILogger } from '@lib/services/logger/types';
import { EnvManager } from '@app/setup/env';

export class ConfigLoader {
    private static readonly FileName = 'agentic.config.json';

    constructor(
        private readonly logger: ILogger,
        private readonly fs = new FileService()
    ) {}

    public async load(): Promise<ISetupResponses | undefined> {
        try {
            if (!await this.fs.exists(ConfigLoader.FileName)) {
                return undefined;
            }

            const content = await this.fs.readFile(ConfigLoader.FileName);
            const config = JSON.parse(content) as ISetupResponses;
            
            return await this.mergeWithEnv(config);
        } catch (error) {
            this.logger.error('Failed to load configuration', error);
        }
    }

    private async mergeWithEnv(config: ISetupResponses): Promise<ISetupResponses> {
        const envManager = new EnvManager(this.fs);
        const apiKey = await envManager.getApiKey();
    
        if (apiKey && 'provider' in config.ai) {
            return { ...config, ai: { ...config.ai, apiKey } };
        }
        return config;
    }
}
