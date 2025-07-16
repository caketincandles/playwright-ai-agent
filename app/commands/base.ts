import { devLog } from '@lib/services/logger';
import * as Config from '@src/config';

export interface ICommand {
    execute(): Promise<boolean>;
}

export abstract class BaseCommand implements ICommand {
    constructor(protected readonly config?: Config.Types.IConfigFile) {}

    abstract execute(): Promise<boolean>;

    protected requiresConfig(): boolean {
        if (!this.config) {
            devLog.error(
                `Could not find "${Config.CONSTS.CONFIG_FILE}". Run "npx playwright-ai-agent --init" or manually create config in root first.`,
            );
            return false;
        }
        return true;
    }
}
