import FileService from '@lib/services/file';

export class EnvManager {
    private readonly fs: FileService;

    constructor() {
        this.fs = new FileService();
    }

    public async updateApiKey(apiKey: string): Promise<void> {
        const existing = await this.readEnv();
        const updated = this.replaceApiKey(existing, apiKey);
        await this.fs.writeFile('.env', updated);
    }

    public async getApiKey(): Promise<string | undefined> {
        const content = await this.readEnv();
        const match = /^AI_API_KEY=(.*)$/m.exec(content);
        return match?.[1];
    }

    private async readEnv(): Promise<string> {
        if (await this.fs.exists('.env')) {
            return await this.fs.readFile('.env');
        }
        return '';
    }

    private replaceApiKey(content: string, newKey: string): string {
        const lines = content.split('\n').filter(line => !line.startsWith('AI_API_KEY='));
        lines.push(`AI_API_KEY=${newKey}`);
        return lines.join('\n') + '\n';
    }
}
