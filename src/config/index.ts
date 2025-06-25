import FileService from '@lib/services/file';
import { IConfig } from '@src/config/types';
import { CONFIG_FILE } from '@src/config/consts';
import * as Logger from '@lib/services/logger';

export default class Config {
    private readonly fs: FileService;
    private readonly logger = Logger.Log['Developer-Log']();

    constructor() {
        this.fs = new FileService();
    }

    public async load(): Promise<IConfig | undefined> {
        try {
            if (!await this.fs.exists(CONFIG_FILE)) {
                return undefined;
            }

            const content = await this.fs.readFile(CONFIG_FILE);
            return JSON.parse(content) as IConfig;
        } catch (error) {
            this.logger.error('Failed to load configuration', error);
        }
    }
}
