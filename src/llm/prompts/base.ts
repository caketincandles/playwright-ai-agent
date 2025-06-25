import type * as Types from '@src/llm/prompts/types';
import * as CONSTS from '@src/llm/prompts/consts';
import FileService from '@lib/services/file';
import Config from '@src/config';
import { INSTRUCTIONS, MAIN_OBJECTIVE } from 'src/llm/prompts/core/task';
import type { TService } from '@src/llm/types';
import { RULES } from '@src/llm/prompts/core/rules';

export abstract class BasePrompt implements Types.IXmlSchema {
    public readonly identity = CONSTS.IDENTITY;
    public readonly main_objective: string;
    public readonly instructions: string[];
    protected readonly serviceRules: Record<Types.TPlaywrightFile, string[]>;

    public code: Types.ITargetFiles;

    public abstract rules: string[];

    protected abstract target: Types.TPlaywrightFile;

    constructor(
        protected readonly filePaths: string[], 
        protected readonly service: TService
    ) {
        this.code = {
            content: [],
        };

        void this.loadData();

        this.main_objective = MAIN_OBJECTIVE[this.service];
        this.instructions = INSTRUCTIONS[this.service];
        this.serviceRules = RULES[this.service];
    }

    private async loadData(): Promise<void> {
        await this.loadFileContents();
        await this.loadConfig();
    }

    private async loadFileContents(): Promise<void> {
        const contents: string[] = [];
        const fs = new FileService();

        for (const filePath of this.filePaths) {
            contents.push(await fs.readFile(filePath));
        }
        
        this.code = {
            ...this.code,
            content: contents
        };
    }

    private async loadConfig(): Promise<void> {
        const config = await new Config().load();
        let inclusions = undefined;

        if (this.target === CONSTS.PLAYWRIGHT_FILE.LOCATOR) {
            inclusions = {
                classSuffixes: config?.locators.classSuffixes,
                paramSuffixes: config?.locators.paramSuffixes,
            }
        }

        if (this.target === CONSTS.PLAYWRIGHT_FILE.PAGE) {
            inclusions = {
                classSuffixes: config?.pages.classSuffixes,
            }
        }

        this.code = {
            ...this.code,
            inclusions
        }
    }
}
