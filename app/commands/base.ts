import { devLog } from '@lib/services/logger';
import { IConfig } from '@src/config/types';

export interface ICommand {
    execute(): Promise<boolean>;
}

export abstract class BaseCommand implements ICommand {
    constructor(protected readonly config?: IConfig) {}

    abstract execute(): Promise<boolean>;

    protected requiresConfig(): boolean {
        if (!this.config) {
            devLog.error(
                'No configuration found. Run "npx playwright-ai-agent --init" first.',
            );
            return false;
        }
        return true;
    }
}
