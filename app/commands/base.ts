import { ILogger } from '@lib/services/logger/types';
import { ISetupResponses } from '@app/setup/types';

export interface ICommand {
    execute(): Promise<boolean>;
}

export abstract class BaseCommand implements ICommand {
    constructor(
        protected readonly logger: ILogger,
        protected readonly config?: ISetupResponses
    ) {}

    abstract execute(): Promise<boolean>;

    protected requiresConfig(): boolean {
        if (!this.config) {
            this.logger.error('No configuration found. Run "npx playwright-ai-agent init" first.');
            return false;
        }
        return true;
    }
}
