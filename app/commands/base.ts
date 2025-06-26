import { IBaseLogger } from '@lib/services/logger/types';
import { IConfig } from '@src/config/types';

export interface ICommand {
    execute(): Promise<boolean>;
}

export abstract class BaseCommand implements ICommand {
    constructor(
        protected readonly logger: IBaseLogger,
        protected readonly config?: IConfig,
    ) {}

    abstract execute(): Promise<boolean>;

    protected requiresConfig(): boolean {
        if (!this.config) {
            this.logger.error(
                'No configuration found. Run "npx playwright-ai-agent --init" first.',
            );
            return false;
        }
        return true;
    }
}
