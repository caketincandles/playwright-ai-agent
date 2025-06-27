import process from 'process';
import FileService from '@lib/services/file';
import * as CONSTS from '@src/config/consts';
import * as Logger from '@lib/services/logger';
import * as Types from '@src/config/types';

export { CONSTS, Types };

export class Config {
    private readonly fs: FileService;
    protected readonly log: Logger.Developer.Types.IDeveloperLog;

    constructor() {
        this.log = Logger.logger.dev;
        this.fs = new FileService();
    }

    public async load(): Promise<Types.IConfig | undefined> {
        try {
            if (!(await this.fs.exists(CONSTS.CONFIG_FILE))) {
                return undefined;
            }

            const content = await this.fs.readFile(CONSTS.CONFIG_FILE);
            return JSON.parse(content) as Types.IConfig;
        } catch (error) {
            this.log.error('Failed to load configuration', error);
            process.exit(1);
        }
    }
}
