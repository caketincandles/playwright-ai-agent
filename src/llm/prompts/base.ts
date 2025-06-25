import type * as Types from '@src/llm/prompts/types';
import * as CONSTS from '@src/llm/prompts/consts';
import FileService from '@lib/services/file';
import Config from '@src/config';
import { INSTRUCTIONS, MAIN_OBJECTIVE } from 'src/llm/prompts/core/task';
import type { TService } from '@src/llm/types';
import { RULES } from '@src/llm/prompts/core/rules';

export abstract class BasePrompt implements Types.IXmlSchema {
    private static readonly CONFIG_MAP: Record<
        Types.TPlaywrightFile,
        (config: unknown) => Types.ISuffixes | undefined
    > = {
        [CONSTS.PLAYWRIGHT_FILE.LOCATOR]: (config) => {
            const cfg = config as {
                locators?: {
                    classSuffixes?: string[];
                    paramSuffixes?: string[];
                };
            };
            return {
                classSuffixes: cfg.locators?.classSuffixes,
                paramSuffixes: cfg.locators?.paramSuffixes,
            };
        },
        [CONSTS.PLAYWRIGHT_FILE.PAGE]: (config) => {
            const cfg = config as { pages?: { classSuffixes?: string[] } };
            return {
                classSuffixes: cfg.pages?.classSuffixes,
            };
        },
        [CONSTS.PLAYWRIGHT_FILE.TEST]: () => undefined,
    };

    private dataLoadPromise?: Promise<void>;
    private isLoaded = false;

    protected readonly serviceRules: Record<Types.TPlaywrightFile, string[]>;
    protected abstract target: Types.TPlaywrightFile;

    public readonly identity = CONSTS.IDENTITY;
    public abstract rules: string[];

    public main_objective: string;
    public instructions: string[];
    public code: Types.ITargetFiles = { content: [] };

    constructor(
        protected readonly filePaths: string[],
        protected readonly service: TService,
    ) {
        this.main_objective = MAIN_OBJECTIVE[this.service];
        this.instructions = INSTRUCTIONS[this.service];
        this.serviceRules = RULES[this.service];

        this.dataLoadPromise = this.loadData().then(() => {
            this.isLoaded = true;
        });
    }

    public setPromptValues(overrides: {
        mainObjective?: string;
        instructions?: string[];
    }): void {
        if (overrides.mainObjective !== undefined) {
            this.main_objective = overrides.mainObjective;
        }
        if (overrides.instructions !== undefined) {
            this.instructions = overrides.instructions;
        }
    }

    protected async ensureDataLoaded(): Promise<void> {
        if (this.dataLoadPromise) {
            await this.dataLoadPromise;
        }
    }

    private async loadData(): Promise<void> {
        const [fileContents, config] = await Promise.all([
            this.loadFileContents(),
            new Config().load(),
        ]);

        this.code = {
            content: fileContents,
            inclusions: BasePrompt.CONFIG_MAP[this.target](config),
        };
    }

    private async loadFileContents(): Promise<string[]> {
        const fs = new FileService();
        return Promise.all(
            this.filePaths.map((filePath) => fs.readFile(filePath)),
        );
    }
}
