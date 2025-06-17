import { FileService } from "@lib/services/file";
import { ISetupResponses } from './types';
import { ILogger } from "@lib/services/logger/types";
import { EnvManager } from "./env";

export class Config {
    private static readonly FileName = 'agentic.config.json';
    private readonly fs: FileService;

    constructor(private logger: ILogger, private responses: ISetupResponses){
        this.fs = new FileService();
    }

    public async save(): Promise<boolean> {
        const backups: { file: string; content: string }[] = [];

        try {
            // Create backups only if files already exist
            await this.createBackups(backups);
            
            // Write new files
            const config = this.buildConfig();
            await this.fs.writeFile(Config.FileName, JSON.stringify(config, null, 2));
            
            if (this.responses.ai.apiKey) {
                const envManager = new EnvManager(this.fs);
                await envManager.updateApiKey(this.responses.ai.apiKey);
            }
            
            return true;
            
        } catch (error) {
            this.logger.warn('File write failed, restoring backups...');
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
            pages: this.responses.pages
        };
    }

    private async createBackups(backups: { file: string; content: string }[]): Promise<void> {
        const filesToCheck = [Config.FileName, '.env'];
        
        for (const file of filesToCheck) {
            if (await this.fs.exists(file)) {
                const content = await this.fs.readFile(file);
                backups.push({ file, content });
            }
        }
    }

    private async restoreBackups(backups: { file: string; content: string }[]): Promise<void> {
        for (const backup of backups) {
            try {
                await this.fs.writeFile(backup.file, backup.content);
            } catch (restoreError) {
                this.logger.error(`Failed to restore ${backup.file}`, restoreError);
            }
        }
    }    
}
