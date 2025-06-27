import * as Config from '@src/config';
import FileService from '@lib/services/file';
import { EnvManager } from '@app/setup/env';
import { devLog } from '@lib/services/logger';

export class ConfigSetup {
    private readonly fs: FileService;

    constructor(private responses: Config.Types.IConfig) {
        this.fs = new FileService();
    }

    public async save(): Promise<boolean> {
        const backups: { file: string; content: string }[] = [];

        try {
            await this.createBackups(backups);

            const config = this.buildConfig();
            await this.fs.writeFile(
                Config.CONSTS.CONFIG_FILE,
                JSON.stringify(config, null, 2),
            );

            if (this.responses.ai.apiKey) {
                const envManager = new EnvManager();
                await envManager.updateApiKey(this.responses.ai.apiKey);
            }

            return true;
        } catch (error) {
            devLog.warn('File write failed, restoring backups...');
            await this.restoreBackups(backups);
            throw error;
        }
    }

    private buildConfig() {
        // Remove the API Key from the config file, must be stored in `.env` to avoid errors
        const aiConfig = { ...this.responses.ai };
        delete aiConfig.apiKey;

        return {
            lastUpdated: new Date().toLocaleString('en-GB'),
            ai: aiConfig,
            locators: this.responses.locators,
            pages: this.responses.pages,
        };
    }

    private async createBackups(
        backups: { file: string; content: string }[],
    ): Promise<void> {
        const filesToCheck = [Config.CONSTS.CONFIG_FILE, '.env'];

        for (const file of filesToCheck) {
            if (await this.fs.exists(file)) {
                const content = await this.fs.readFile(file);
                backups.push({ file, content });
            }
        }
    }

    private async restoreBackups(
        backups: { file: string; content: string }[],
    ): Promise<void> {
        for (const backup of backups) {
            try {
                await this.fs.writeFile(backup.file, backup.content);
            } catch (restoreError) {
                devLog.error(
                    `Failed to restore ${backup.file}`,
                    restoreError,
                );
            }
        }
    }
}
